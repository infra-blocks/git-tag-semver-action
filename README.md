# git-tag-semver-action

This action manages semantic versioning compliant tags on a GitHub repository, and updates them
according to user provided version bump types. Read more [here](action.yml).

## Usage

Describe the action usage here, and provide an example invocation in a GitHub workflow.

## Development

This project is written in Typescript and leverages `nvm` to manage its version.

### Setup

Once `nvm` is installed, simply run the following:

```
nvm install
npm install
``` 

### Releasing

The releasing is handled at git level with semantic versioning tags. Those are automatically generated and managed
by the [git-tag-semver-from-label-action](https://github.com/infrastructure-blocks/git-tag-semver-from-label-action).
