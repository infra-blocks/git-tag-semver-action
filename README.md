# git-tag-semver-action

This action manages semantic versioning compliant tags on a GitHub repository, and updates them
according to user provided version bump types. Read more [here](action.yml).

## Usage

To come

## Development

This project is written in Typescript and leverages `nvm` to manage its version. It also uses Git hooks
to automatically build and commit compiled code. This last part emerges from the fact that GitHub actions
run Javascript (and not typescript) and that all the node_modules/ are expected to be provided in the Git
repository of the action.

Having a Git hook to compile automatically helps in diminishing the chances that a developer forgets to
provide the compiled sources in a change request.

### Setup

Once `nvm` is installed, simply run the following:

```
nvm install
npm install
``` 

### Releasing

Once a PR has been approved and merged, the maintainer should create and push a tag on the latest HEAD ref.
The tag should follow [semantic versioning](https://semver.org/). Example:

```shell
git checkout master
git pull
git tag v1.0.3 # patch update
git push --tags
```
