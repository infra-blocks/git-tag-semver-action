import { Context } from "@actions/github/lib/context.js";
import { getVersionTags, GitTagVersion } from "./version.js";
import * as core from "@actions/core";
import { createGitCli, GitCli } from "./git.js";
import semver from "semver";
import { PullRequest } from "@infra-blocks/github";

// TODO: move into lib?
export type Outputs = Record<string, string>;

export interface Handler<O extends Outputs> {
  handle(): Promise<O>;
}

export interface Config {
  gitHubToken: string;
  version: GitTagVersion;
}

export type GitTagSemverOutputs = Outputs;

export class GitTagSemverHandler implements Handler<GitTagSemverOutputs> {
  private static ERROR_NAME = "GitTagSemverHandlerError";

  private readonly pullRequest: PullRequest;
  private readonly config: Config;
  private readonly git: GitCli;

  constructor(params: {
    pullRequest: PullRequest;
    config: Config;
    git: GitCli;
  }) {
    const { pullRequest, config, git } = params;
    this.pullRequest = pullRequest;
    this.config = config;
    this.git = git;
  }

  async handle(): Promise<GitTagSemverOutputs> {
    await this.checkoutBaseRef();
    const latestTag = await this.getLatestTag();
    const tags = getVersionTags({
      currentVersion: latestTag,
      releaseType: this.config.version,
    });
    await this.tagAndPublish({ tags });
    return {};
  }

  private async checkoutBaseRef() {
    const ref = this.pullRequest.base.ref;
    core.info(`checking out ${ref}`);
    await this.git.checkout({ ref });
  }

  private async getLatestTag(): Promise<string> {
    const versionTags = await this.git.getRemoteTags({
      remote: this.getGitRemote(),
      pattern: "v*",
    });
    if (core.isDebug()) {
      core.debug(`found version tags: ${JSON.stringify(versionTags)}`);
    }
    // It's possible that there are no version tags. For example, when it's the first published version.
    // In which case, we simply start at v0.0.0 and apply the version bump on that.
    if (versionTags.length === 0) {
      return "v0.0.0";
    }

    // Remove partials.
    const semverTags = versionTags.filter((tag) => semver.valid(tag) != null);
    if (semverTags.length === 0) {
      throw new Error(
        `found version tags but no fully compliant version tag: ${JSON.stringify(
          versionTags
        )}`
      );
    }

    // Sort and pick the last one.
    semverTags.sort(semver.rcompare);
    return semverTags[0];
  }

  private async tagAndPublish(params: { tags: ReadonlyArray<string> }) {
    const { tags } = params;
    for (const tag of tags) {
      core.info(`tagging HEAD with: ${tag}`);
      // Have to tag force here to update an existing tag.
      await this.git.tag({ tag, force: true });
    }

    const remote = this.getGitRemote();
    for (const tag of tags) {
      core.info(`pushing tag ${tag} to remote`);
      // Have to push force here too to update the remote tags if one already existed.
      await this.git.push({ remote, ref: tag, force: true });
    }
  }

  private getGitRemote(): string {
    const repoFullName = this.pullRequest.head.repo.full_name;
    return `https://${this.config.gitHubToken}@github.com/${repoFullName}.git`;
  }
}

export function createHandler(params: {
  context: Context;
  config: Config;
}): Handler<GitTagSemverOutputs> {
  const { context, config } = params;
  return new GitTagSemverHandler({
    pullRequest: context.payload["pull_request"] as PullRequest,
    config,
    git: createGitCli(),
  });
}
