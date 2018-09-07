# Contributing to picasso.js

You are more than welcome to contribute to picasso.js! Follow these guidelines and you will be ready to start:

- [Code of conduct](#code-of-conduct)
- [Bugs](#bugs)
- [Features](#features)
- [Developing](#developing)
- [Git guidelines](#git)
- [Signing the CLA](#cla)

## <a name="code-of-conduct"></a> Code of conduct

Please read and follow our [Code of conduct](https://github.com/qlik-oss/open-source/blob/master/CODE_OF_CONDUCT.md)

## <a name="bugs"></a> Bugs

Bugs can be reported by adding issues in the repository. Submit your bug fix by creating a Pull Request, following the [GIT guidelines](#git).

> Please make sure to browse through existing [issues](https://github.com/qlik-oss/picasso.js/labels/bug) before creating a new one.

## <a name="features"></a> Features

Features can be requested by adding issues in the repository. If the feature includes new designs or bigger changes,
please be prepared to discuss the changes with us so we can cooperate on how to best include them.

Submit your feature by creating a Pull Request, following the [GIT guidelines](#git). Include any related documentation changes.

## <a name="developing"></a> Developing

### Prerequisits

- [Node.js](https://nodejs.org/) 10+ and [yarn](https://yarnpkg.com) installed

### Project structure

This is a multi-package repository which uses [lerna](https://github.com/lerna/lerna) for package task management and publishing.

- `docs/`: contains documentation templates
- `examples/`: contains simple examples of usage
- `plugins/`: contains plugin packages
- `packages/picasso.js`: contains the main `picasso.js` package
- `scripts/`: contains build scripts
- `test/`: contains test configs
- `website/`: contains source code for the picasso.js website

### Building

To install and build all packages run:

```sh
$ yarn
$ yarn run build
```

This will generate UMD packages for

- the main package under `/packages/picasso.js/dist`
- each plugin under `/plugins/*/dist`

### Development worklow

- `yarn run build` generates UMD bundles for all packages
- `yarn run lint` checks code style
- `yarn run test` runs all tests

## <a name="git"></a> Git Guidelines

Generally, development should be done directly towards the `master` branch.

### Workflow

1. Fork and clone the repository
    ```sh
    git clone git@github.com:YOUR-USERNAME/picasso.js.git
    ```

1. Create a branch in the fork
    
    The branch should be based on the `master` branch in the master repository.

    ```sh
    git checkout -b my-feature-or-bugfix master
    ```

1. Commit changes on your branch

    Commit changes to your branch, following the commit message format.

    ```sh
    git commit -m "fix: properly formatted SET statements."
    ```

1. Push the changes to your fork

    ```sh
    git push -u myfork my-feature-or-bugfix
    ```

1. Create a Pull Request

    > Before creating a Pull Request, make sure to sign the [CLA](#cla)

    In the Github UI of your fork, create a Pull Request to the `master` branch of the master repository.

    If the branch has merge conflicts or has been outdated, please do a rebase against the `master` branch.


### <a name="commit"></a> Commit message guidelines

Commit messages should follow the [commit message convention](https://conventionalcommits.org/).

#### Type

Should be one of the following:

- **chore:** Changes to build and dev processes/tools
- **docs:** Changes to documentation
- **feat:** A new feature
- **fix:** A bug fix
- **refactor:** Changes to production code that is neither a new feature nor a bug fix
- **style:** Changes to code style formatting (white space, commas etc)
- **test:** Changes in test cases of production code

#### Scope

The `<scope>` of the commit is optional and can be omitted. When used though, it should describe the place or part of the project, e.g. `docs(examples)`, `feat(data)` etc.

## <a name="cla"></a> Signing the CLA

We need you to sign our Contributor License Agreement (CLA) before we can accept your Pull Request. Visit this link for more information: https://github.com/qlik-oss/open-source/blob/master/sign-cla.md.
