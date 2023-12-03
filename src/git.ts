// https://github.com/orgs/infrastructure-blocks/projects/1/views/1?pane=issue&itemId=46399825 ts-git
import { basename } from "path";
import { BaseCli, CliOptions } from "./cli.js";

/**
 * Class encapsulating operations with the Git CLI installed on the executing code's machine.
 *
 * All operations are asynchronous. The interface provides convenience methods where the Git
 * cli processes' output is parsed and sometimes interpreted for the user.
 */
export class GitCli extends BaseCli<GitCli> {
  constructor(options?: CliOptions) {
    super({ command: "git", ...options });
  }

  withOptions(options?: CliOptions): GitCli {
    return new GitCli(options);
  }

  /**
   * Returns the git root of the git repository of the current working directory.
   */
  async getRoot(): Promise<string> {
    const { stdout: root } = await this.runAsync([
      "rev-parse",
      "--show-toplevel",
    ]);
    return root;
  }

  /**
   * Returns the local git user.
   */
  async getUser(): Promise<string> {
    const { stdout: user } = await this.runAsync(["config", "user.name"]);
    return user;
  }

  /**
   * Returns true if the current tree is dirty, false otherwise.
   */
  async isTreeDirty(): Promise<boolean> {
    const { stdout: status } = await this.runAsync(["status", "--porcelain"]);
    return status !== "";
  }

  /**
   * Returns the current git branch name.
   */
  async getCurrentBranchName(): Promise<string> {
    const { stdout: branchName } = await this.runAsync([
      "symbolic-ref",
      "--short",
      "HEAD",
    ]);
    return branchName;
  }

  /**
   * Returns the HEAD commit SHA of the remote branch specified by the parameters.
   *
   * @param params.branch - The name of the remote branch (without the repository prefix). Defaults to current branch.
   * @param params.remote - The remote. Defaults to "origin".
   */
  async getRemoteBranchHeadCommit(params?: {
    branch?: string;
    remote?: string;
  }): Promise<string> {
    const { branch = await this.getCurrentBranchName(), remote = "origin" } =
      params || {};

    const { stdout: output } = await this.runAsync([
      "ls-remote",
      "--heads",
      "--quiet",
      "--exit-code",
      remote,
      branch,
    ]);
    return output.split("\t")[0];
  }

  /**
   * Returns the current branch head commit SHA.
   */
  async getCurrentBranchHeadCommit(): Promise<string> {
    const { stdout: headCommit } = await this.runAsync(["rev-parse", "HEAD"]);
    return headCommit;
  }

  /**
   * Returns the remote URL
   *
   * @params.remote - The remote. Defaults to "origin".
   */
  async getRemoteUrl(params?: { remote?: string }): Promise<string> {
    const { remote = "origin" } = params || {};

    const { stdout: url } = await this.runAsync([
      "config",
      "--get",
      `remote.${remote}.url`,
    ]);
    return url;
  }

  /**
   * Returns all local git tags that satisfy the provided pattern.
   *
   * If none is provided, then all git tags are returned.
   * The default order of git is lexicographical.
   *
   * @param params.pattern - The git tag pattern to use to filter results. Defaults to "*".
   *
   * @return The git tags matching the provided pattern for the current repository in lexicographical order.
   */
  async getTags(params?: { pattern?: string }): Promise<Array<string>> {
    const { pattern = "*" } = params || {};
    const { stdout: tags } = await this.runAsync([
      "tag",
      "-l",
      "--sort=refname",
      pattern,
    ]);
    return tags.split("\n").filter((token) => token.trim() !== "");
  }

  /**
   * Returns all remote git tags that satisfy the provided pattern.
   *
   * If no remote is provided, then "origin" is assumed.
   * If no pattern is provided, then all git tags are returned.
   * The default order of git is lexicographical.
   *
   * @param params.remote - The remote to query. Defaults to "origin".
   * @param params.pattern - The git tag pattern to use to filter results. Defaults to "*".
   *
   * @return The git tags matching the provided pattern for the current repository in lexicographical order.
   */
  async getRemoteTags(params?: {
    remote?: string;
    pattern?: string;
  }): Promise<Array<string>> {
    const { remote = "origin", pattern = "*" } = params || {};

    const { stdout } = await this.runAsync([
      "ls-remote",
      "--tags",
      "--sort=refname",
      remote,
      pattern,
    ]);

    const entries = stdout.split("\n").filter((entry) => entry.trim() !== "");
    // An entry looks like:
    // 6ea4552d3d698610641bfa5952bbc57989718a05	refs/tags/v1.2.3
    const entryRegex = /\S+\s+refs\/tags\/(\S+)/;
    return entries.map((entry) => {
      const captures = entryRegex.exec(entry);
      if (captures == null) {
        throw new Error(`unexpected remote tag entry: ${entry}`);
      }
      return captures[1];
    });
  }

  /**
   * Returns true if the tag exists on the remote.
   *
   * @param params.tag - The tag to verify.
   * @param params.remote - The remote to query. Defaults to "origin".
   *
   * @return True if the tag exists on the remote, false otherwise.
   */
  async remoteTagExists(params: {
    tag: string;
    remote?: string;
  }): Promise<boolean> {
    const { tag, remote = "origin" } = params;
    const { stdout: output } = await this.runAsync([
      "ls-remote",
      remote,
      `refs/tags/${tag}`,
    ]);
    // If it contains an entry, it will be of the form <SHA1>\trefs/tags/<tag>
    return output.trim().length !== 0;
  }

  /**
   * Creates/updates a git tag.
   *
   * By default, this method only creates new tags. If the user needs to update
   * a tag, then the force option needs to be set.
   *
   * @param params.tag - The new tag to create.
   * @param params.ref - The ref to attach it to. Defaults to "HEAD"
   * @param params.force - Whether to force the update of the tag. Defaults to false.
   */
  async tag(params: {
    tag: string;
    ref?: string;
    force?: boolean;
  }): Promise<void> {
    const { tag, ref = "HEAD", force = false } = params;
    const args = ["tag", tag, ref];
    if (force) {
      args.push("--force");
    }
    await this.runAsync(args);
  }

  /**
   * Deletes a tag locally.
   *
   * @param params.tag - The tag to remove.
   */
  async deleteTag(params: { tag: string }): Promise<void> {
    const { tag } = params;
    const args = ["tag", "-d", tag];
    await this.runAsync(args);
  }

  /**
   * Runs git checkout on the provided ref.
   *
   * @param params.ref - The ref to check out.
   */
  async checkout(params: { ref: string }): Promise<void> {
    const { ref } = params;
    await this.runAsync(["checkout", ref]);
  }

  /**
   * Runs git push.
   *
   * @param options.remote - The "remote" repository that is destination of a push operation. This parameter
   * can be either a URL (see the section GIT URLS below) or the name of a remote. Defaults to "origin".
   * @param options.deletion - Whether to turn on deletion or not.
   * @param options.force - Use the --force option
   * @param options.ref - Specify what destination ref to update with what source object.
   */
  async push(options?: {
    force?: boolean;
    deletion?: boolean;
    remote?: string;
    ref?: string;
  }): Promise<void> {
    const { force, remote = "origin", deletion, ref } = options || {};
    const args = ["push"];
    if (force) {
      args.push("--force");
    }
    if (deletion) {
      args.push("--delete");
    }
    args.push(remote);
    if (ref != null) {
      args.push(ref);
    }
    await this.runAsync(args);
  }

  /**
   * Runs git pull.
   */
  async pull(): Promise<void> {
    await this.runAsync(["pull"]);
  }

  /**
   * Returns the name of the current repository we are in.
   */
  async getCurrentRepositoryName(): Promise<string> {
    const url = await this.getRemoteUrl();
    return basename(url, ".git");
  }
}

/**
 * Returns a {@link GitCli} that will operate with the provided options.
 *
 * @param options - See {@link CliOptions}
 */
export function createGitCli(options?: CliOptions): GitCli {
  return new GitCli(options);
}

// SHA-1 checksums are hex strings of 40 characters.
const FULL_SHA_REGEXP = /^[0-9a-fA-F]{40}$/;
// The shortest can be 4 characters and no less.
const PARTIAL_SHA_REGEXP = /^[0-9a-fA-F]{4,40}$/;

/**
 * Returns whether the provided value is a valid SHA-1 checksum or not.
 *
 * SHA-1 checksums are hexadecimal strings of 40 characters.
 *
 * @param sha - The SHA-1 value to test
 *
 * @return True if it's a valid SHA-1 checksum.
 */
export function isSha(sha: string): boolean {
  return FULL_SHA_REGEXP.test(sha);
}

/**
 * Returns whether the provided value is a valid partial SHA-1 checksum or not.
 *
 * It has to be minimally made of 4 characters and can go up to the full length.
 *
 * @see isSha
 *
 * @param sha - The SHA-1 value to test.
 *
 * @return True if it's a valid partial SHA-1 checksum.
 */
export function isPartialSha(sha: string): boolean {
  return PARTIAL_SHA_REGEXP.test(sha);
}

/**
 * Extracts the branch name from a Git reference
 *
 * The git ref is expected to be of the form "refs/heads/<branch>". If the format
 * is not matched, an error is thrown.
 *
 * For example, if a tag ref is passed instead (refs/tags/<tag>), the function will throw.
 *
 * @param ref - The head ref of the branch.
 *
 * @return The branch name.
 */
export function branchNameFromRef(ref: string): string {
  const regexp = /refs\/heads\/(.*)/;
  const capture = regexp.exec(ref);

  if (capture == null) {
    throw new Error(`invalid branch ref ${ref}`);
  }

  return capture[1];
}
