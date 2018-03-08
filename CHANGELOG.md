# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.6.0"></a>
# [0.6.0](https://github.com/qlik-oss/picasso.js/compare/v0.5.3...v0.6.0) (2018-03-08)


### Bug Fixes

* **component-box:** fix scale sizing ([75d2cac](https://github.com/qlik-oss/picasso.js/commit/75d2cac))
* **legend-cat:** improve alignment of content ([#45](https://github.com/qlik-oss/picasso.js/issues/45)) ([58fd732](https://github.com/qlik-oss/picasso.js/commit/58fd732))
* **q:** take localeInfo into account when formatting ([e4151c5](https://github.com/qlik-oss/picasso.js/commit/e4151c5))
* **renderer:** reset scene when clearing render ([#47](https://github.com/qlik-oss/picasso.js/issues/47)) ([3793443](https://github.com/qlik-oss/picasso.js/commit/3793443))


### Code Refactoring

* callback argument on scale settings ([#36](https://github.com/qlik-oss/picasso.js/issues/36)) ([ce6b0f5](https://github.com/qlik-oss/picasso.js/commit/ce6b0f5))


### Features

* **q:** add support for custom number abbreviations ([dcc5fc0](https://github.com/qlik-oss/picasso.js/commit/dcc5fc0))
* brush area component ([#44](https://github.com/qlik-oss/picasso.js/issues/44)) ([97f859f](https://github.com/qlik-oss/picasso.js/commit/97f859f))


### BREAKING CHANGES

* Exposes similar callback argument as the component settings. Valid for scales defined under the `scales` property and directly in a component definition.

*All scales* settings now supports a callback function. Those who had support previously have the their callback argument changed to an object.




<a name="0.5.3"></a>
## [0.5.3](https://github.com/qlik-oss/picasso.js/compare/v0.5.1...v0.5.3) (2018-02-23)


### Bug Fixes

* **data:** falsy fields are not included in data extraction ([12e0221](https://github.com/qlik-oss/picasso.js/commit/12e0221))
* add missing source to field ([#30](https://github.com/qlik-oss/picasso.js/issues/30)) ([fc8eea3](https://github.com/qlik-oss/picasso.js/commit/fc8eea3))
* band scale datum method returns undefined ([#38](https://github.com/qlik-oss/picasso.js/issues/38)) ([e9bb3a5](https://github.com/qlik-oss/picasso.js/commit/e9bb3a5))
* exception in label component when target node is outside render container ([#34](https://github.com/qlik-oss/picasso.js/issues/34)) ([1a62c6d](https://github.com/qlik-oss/picasso.js/commit/1a62c6d))
* getAffectedShapes should not return duplicates ([#33](https://github.com/qlik-oss/picasso.js/issues/33)) ([c7b8792](https://github.com/qlik-oss/picasso.js/commit/c7b8792))
* legend title is duplicated ([#35](https://github.com/qlik-oss/picasso.js/issues/35)) ([543aa06](https://github.com/qlik-oss/picasso.js/commit/543aa06))
