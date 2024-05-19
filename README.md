# git-tag-semver-action
[![Release](https://github.com/infra-blocks/git-tag-semver-action/actions/workflows/release.yml/badge.svg)](https://github.com/infra-blocks/git-tag-semver-action/actions/workflows/release.yml)
[![Self Test](https://github.com/infra-blocks/git-tag-semver-action/actions/workflows/self-test.yml/badge.svg)](https://github.com/infra-blocks/git-tag-semver-action/actions/workflows/self-test.yml)
[![Update From Template](https://github.com/infra-blocks/git-tag-semver-action/actions/workflows/update-from-template.yml/badge.svg)](https://github.com/infra-blocks/git-tag-semver-action/actions/workflows/update-from-template.yml)

This action manages semantic versioning git tags. What it does depend on the version bump type provided by the
user.

The first time this action is run, it will create 3 tags:
- a partial major tag such as `v<major>`
- a partial minor tag such as `v<major>.<minor>`
- the full semver tag such as `v<major>.<minor>.<patch>`

If the version bump is "patch", then this action creates a new semver tag like `v<major>.<minor>.<patch + 1>` on the
HEAD commit. Both the matching major and minor tags are *moved* to the same commit.

If the version bump is "minor", then this action creates a new semver tag like `v<major>.<minor +1>.0`, a new
partial minor tag like `v<major>.<minor + 1>` and moves the partial major tag to the HEAD commit.

If the version bump is "minor", then this action creates a new semver tag like `v<major + 1>.0.0`, a new
partial minor tag like `v<major + 1>.0` and a new partial major tag like `v<major + 1>`.

## Inputs

|  Name   | Required | Description                                                |
|:-------:|:--------:|------------------------------------------------------------|
| version |   true   | The version bump type. Either "major", "minor" or "patch". |
| dry-run |  false   | Whether to push the resulting tags.                        |

## Outputs

| Name | Description                                                                                                       |
|:----:|-------------------------------------------------------------------------------------------------------------------|
| tags | The tags applied to the ref as a stringified JSON array. These will be populated even though dry-run is selected. |

## Permissions

This action leverages the Git CLI but does not configure it. If you've configured it with the ${{ github.token }}
then you would need the following permissions:

|  Scope   | Level | Reason            |
|:--------:|:-----:|-------------------|
| contents | write | To push new tags. |

However, it's possible that you have configured Git with a personal access token (PAT). This is required, for instance,
if the tags you are pushing are [protected](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/configuring-tag-protection-rules).
In this case, no permissions block is required.

## Usage

### With GITHUB_TOKEN

```yaml
name: Git Tag Semver

on:
  push: ~

permissions:
  contents: write

jobs:
  git-tag-semver:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
      - id: git-tag
        uses: infra-blocks/git-tag-semver-action@v1
        with:
          version: major
```

### With PAT for protected tags

```yaml
name: Git Tag Semver

on:
  push: ~

permissions:
  contents: read # To checkout the code.

jobs:
  git-tag-semver:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.PAT }}
      - id: git-tag
        uses: infra-blocks/git-tag-semver-action@v1
        with:
          version: major
```
