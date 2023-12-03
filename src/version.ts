//TODO: in git lib?
import { checkNotNull } from "@infra-blocks/checks";
import semver from "semver";

export type GitTagVersion = "patch" | "minor" | "major";

export function parseVersion(version: string): GitTagVersion {
  switch (version) {
    case "patch":
    case "minor":
    case "major":
      return version;
    default:
      throw new Error(`unknown git tag version: ${version}`);
  }
}

export function getVersionTags(params: {
  currentVersion: string;
  releaseType: GitTagVersion;
}): [string, string, string] {
  const { currentVersion, releaseType } = params;

  const newVersion = checkNotNull(semver.inc(currentVersion, releaseType));
  const majorTag = `v${semver.major(newVersion)}`;
  const minorTag = `v${semver.major(newVersion)}.${semver.minor(newVersion)}`;
  const fullTag = `v${newVersion}`;

  return [majorTag, minorTag, fullTag];
}
