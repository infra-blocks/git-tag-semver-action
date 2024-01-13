# composite-action-template

Upon creating a repository from this template:
- Remove the [trigger-update-from-template workflow](.github/workflows/trigger-update-from-template.yml)
- Edit the action.yml to correspond to your new action
- Edit the self-test workflow.
- Edit this readme: this summary and the usage section.

## Usage

Describe usage of your action here.

## Development

### Releasing

The releasing is handled at git level with semantic versioning tags. Those are automatically generated and managed
by the [git-tag-semver-from-label-workflow](https://github.com/infrastructure-blocks/git-tag-semver-from-label-workflow).
