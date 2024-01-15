# git-tag-semver-action
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

|     Name      | Required | Description       |
|:-------------:|:--------:|-------------------|
| example-input |   true   | An example input. |

## Outputs

|      Name      | Description        |
|:--------------:|--------------------|
| example-output | An example output. |

## Permissions

|     Scope     | Level | Reason   |
|:-------------:|:-----:|----------|
| pull-requests | read  | Because. |

## Usage

```yaml
name: Template Usage

on:
  push: ~

# The required permissions.
permissions:
  pull-requests: read

# The suggested concurrency controls.
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  example-job:
    runs-on: ubuntu-22.04
    steps:
      - uses: infrastructure-blocks/composite-action-template@v1
```

## Development

### Releasing

The releasing is handled at git level with semantic versioning tags. Those are automatically generated and managed
by the [git-tag-semver-from-label-workflow](https://github.com/infrastructure-blocks/git-tag-semver-from-label-workflow).
