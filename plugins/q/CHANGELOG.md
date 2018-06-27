# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.10.3"></a>
## [0.10.3](https://github.com/qlik-oss/picasso.js/compare/v0.10.2...v0.10.3) (2018-06-27)




**Note:** Version bump only for package picasso-plugin-q

<a name="0.10.2"></a>
## [0.10.2](https://github.com/qlik-oss/picasso.js/compare/v0.10.1...v0.10.2) (2018-06-27)




**Note:** Version bump only for package picasso-plugin-q

<a name="0.10.1"></a>
## [0.10.1](https://github.com/qlik-oss/picasso.js/compare/0.10.0...0.10.1) (2018-06-27)




**Note:** Version bump only for package picasso-plugin-q

<a name="0.10.0"></a>
# [0.10.0](https://github.com/qlik-oss/picasso.js/compare/v0.9.0...v0.10.0) (2018-06-25)


### Bug Fixes

* **q:** fix q brush when layout is missing ([#118](https://github.com/qlik-oss/picasso.js/issues/118)) ([163da33](https://github.com/qlik-oss/picasso.js/commit/163da33))




<a name="0.9.0"></a>
# [0.9.0](https://github.com/qlik-oss/picasso.js/compare/v0.8.0...v0.9.0) (2018-06-14)


### Bug Fixes

* **q:** Register number & time formatter when using q plugin ([#98](https://github.com/qlik-oss/picasso.js/issues/98)) ([37831a3](https://github.com/qlik-oss/picasso.js/commit/37831a3))
* **q:** use auto formatter when qNumFormat is missing ([#91](https://github.com/qlik-oss/picasso.js/issues/91)) ([4f9c2a6](https://github.com/qlik-oss/picasso.js/commit/4f9c2a6))


### Features

* **q:** add support for qTreeData and qMode=K ([#88](https://github.com/qlik-oss/picasso.js/issues/88)) ([e43443d](https://github.com/qlik-oss/picasso.js/commit/e43443d))




<a name="0.7.0"></a>
# [0.7.0](https://github.com/qlik-oss/picasso.js/compare/v0.6.0...v0.7.0) (2018-04-05)


### Bug Fixes

* **q:** extracting data from empty K cubes throws error ([#60](https://github.com/qlik-oss/picasso.js/issues/60)) ([51419c3](https://github.com/qlik-oss/picasso.js/commit/51419c3))


### Chores

* simplify rollup ([#54](https://github.com/qlik-oss/picasso.js/issues/54)) ([39e4c09](https://github.com/qlik-oss/picasso.js/commit/39e4c09))


### BREAKING CHANGES

* Now using `dist/picasso.js` as the only main file. `dist/picasso.min.js` does not exist any more and the published `dist/picasso.js` file is uglified & minifed, and has a sourcemap linked to it.




<a name="0.6.0"></a>
# [0.6.0](https://github.com/qlik-oss/picasso.js/compare/v0.5.3...v0.6.0) (2018-03-08)


### Bug Fixes

* **q:** take localeInfo into account when formatting ([e4151c5](https://github.com/qlik-oss/picasso.js/commit/e4151c5))


### Features

* **q:** add support for custom number abbreviations ([dcc5fc0](https://github.com/qlik-oss/picasso.js/commit/dcc5fc0))




<a name="0.5.3"></a>
## [0.5.3](https://github.com/qlik-oss/picasso.js/compare/v0.5.1...v0.5.3) (2018-02-23)


### Bug Fixes

* **data:** falsy fields are not included in data extraction ([12e0221](https://github.com/qlik-oss/picasso.js/commit/12e0221))
