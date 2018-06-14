# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.9.0"></a>
# [0.9.0](https://github.com/qlik-oss/picasso.js/compare/v0.8.0...v0.9.0) (2018-06-14)


### Bug Fixes

* **dom-renderer:** clear vnode on destory ([#89](https://github.com/qlik-oss/picasso.js/issues/89)) ([406780f](https://github.com/qlik-oss/picasso.js/commit/406780f))
* legend-cat formatter ([#97](https://github.com/qlik-oss/picasso.js/issues/97)) ([1612c82](https://github.com/qlik-oss/picasso.js/commit/1612c82))
* **label-strategy:** Fix error when using rows strategy on non circle slices ([#99](https://github.com/qlik-oss/picasso.js/issues/99)) ([e22a36c](https://github.com/qlik-oss/picasso.js/commit/e22a36c))
* **labels:** ellipsed text in bars strategy ([#87](https://github.com/qlik-oss/picasso.js/issues/87)) ([ff4e11d](https://github.com/qlik-oss/picasso.js/commit/ff4e11d))
* **layout:** do not re-position components on partial data update ([#104](https://github.com/qlik-oss/picasso.js/issues/104)) ([54ee8f2](https://github.com/qlik-oss/picasso.js/commit/54ee8f2))
* **legend-cat:** Remove commented import ([#96](https://github.com/qlik-oss/picasso.js/issues/96)) ([be21b18](https://github.com/qlik-oss/picasso.js/commit/be21b18))
* **q:** Register number & time formatter when using q plugin ([#98](https://github.com/qlik-oss/picasso.js/issues/98)) ([37831a3](https://github.com/qlik-oss/picasso.js/commit/37831a3))
* **q:** use auto formatter when qNumFormat is missing ([#91](https://github.com/qlik-oss/picasso.js/issues/91)) ([4f9c2a6](https://github.com/qlik-oss/picasso.js/commit/4f9c2a6))
* **scene-node:** append all component meta ([#105](https://github.com/qlik-oss/picasso.js/issues/105)) ([62d7fb0](https://github.com/qlik-oss/picasso.js/commit/62d7fb0))


### Features

* **brush-trigger:** Component level flag to disable brush triggers ([#90](https://github.com/qlik-oss/picasso.js/issues/90)) ([f398060](https://github.com/qlik-oss/picasso.js/commit/f398060))
* **label-strategy:** Rows label strategy ([#81](https://github.com/qlik-oss/picasso.js/issues/81)) ([ca35ece](https://github.com/qlik-oss/picasso.js/commit/ca35ece))
* **legend-cat:** legend cat expose scroll offset ([#93](https://github.com/qlik-oss/picasso.js/issues/93)) ([c38d284](https://github.com/qlik-oss/picasso.js/commit/c38d284))
* **q:** add support for qTreeData and qMode=K ([#88](https://github.com/qlik-oss/picasso.js/issues/88)) ([e43443d](https://github.com/qlik-oss/picasso.js/commit/e43443d))
* add strokeDasharray as option to line component ([#106](https://github.com/qlik-oss/picasso.js/issues/106)) ([fb60bd7](https://github.com/qlik-oss/picasso.js/commit/fb60bd7))
* expose theme on chart instance ([#94](https://github.com/qlik-oss/picasso.js/issues/94)) ([ddffb7f](https://github.com/qlik-oss/picasso.js/commit/ddffb7f))
* override categorical color range ([#100](https://github.com/qlik-oss/picasso.js/issues/100)) ([86fa437](https://github.com/qlik-oss/picasso.js/commit/86fa437))




<a name="0.8.0"></a>
# [0.8.0](https://github.com/qlik-oss/picasso.js/compare/v0.7.0...v0.8.0) (2018-05-15)


### Bug Fixes

* **legend-cat:** threshold legend wrong brush source bugfix ([#66](https://github.com/qlik-oss/picasso.js/issues/66)) ([2b3510c](https://github.com/qlik-oss/picasso.js/commit/2b3510c))


### Features

* share per pie slice ([#68](https://github.com/qlik-oss/picasso.js/issues/68)) ([9caaba5](https://github.com/qlik-oss/picasso.js/commit/9caaba5))
* **brush:** link brushes ([#72](https://github.com/qlik-oss/picasso.js/issues/72)) ([1fe6dd0](https://github.com/qlik-oss/picasso.js/commit/1fe6dd0))
* **data:** add parse config ([8c0b4b6](https://github.com/qlik-oss/picasso.js/commit/8c0b4b6))
* **data:** support DSV as input ([7ab9087](https://github.com/qlik-oss/picasso.js/commit/7ab9087))
* **data:** support object array input ([dd32291](https://github.com/qlik-oss/picasso.js/commit/dd32291))
* **label-strategy:** Outside labels for pie slices ([#75](https://github.com/qlik-oss/picasso.js/issues/75)) ([5537175](https://github.com/qlik-oss/picasso.js/commit/5537175))




<a name="0.7.0"></a>
# [0.7.0](https://github.com/qlik-oss/picasso.js/compare/v0.6.0...v0.7.0) (2018-04-05)


### Bug Fixes

* inactive all shapes on brush start ([#56](https://github.com/qlik-oss/picasso.js/issues/56)) ([4053e13](https://github.com/qlik-oss/picasso.js/commit/4053e13))
* **legend-cat:** threshold color rendering order ([#62](https://github.com/qlik-oss/picasso.js/issues/62)) ([333c98d](https://github.com/qlik-oss/picasso.js/commit/333c98d))
* **legend-seq:** Title use fallback from majorScale ([#55](https://github.com/qlik-oss/picasso.js/issues/55)) ([85d1983](https://github.com/qlik-oss/picasso.js/commit/85d1983))
* **q:** extracting data from empty K cubes throws error ([#60](https://github.com/qlik-oss/picasso.js/issues/60)) ([51419c3](https://github.com/qlik-oss/picasso.js/commit/51419c3))


### Chores

* simplify rollup ([#54](https://github.com/qlik-oss/picasso.js/issues/54)) ([39e4c09](https://github.com/qlik-oss/picasso.js/commit/39e4c09))


### Features

* sort extracted data ([#61](https://github.com/qlik-oss/picasso.js/issues/61)) ([6301c83](https://github.com/qlik-oss/picasso.js/commit/6301c83)), closes [#50](https://github.com/qlik-oss/picasso.js/issues/50)


### BREAKING CHANGES

* Now using `dist/picasso.js` as the only main file. `dist/picasso.min.js` does not exist any more and the published `dist/picasso.js` file is uglified & minifed, and has a sourcemap linked to it.




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
