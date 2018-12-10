# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.18.2](https://github.com/qlik-oss/picasso.js/compare/v0.18.1...v0.18.2) (2018-12-10)


### Reverts

* "fix(dock-layout): remove components that are docked at hidden components ([#261](https://github.com/qlik-oss/picasso.js/issues/261))" ([d923123](https://github.com/qlik-oss/picasso.js/commit/d923123))





## [0.18.1](https://github.com/qlik-oss/picasso.js/compare/v0.18.0...v0.18.1) (2018-12-04)


### Bug Fixes

* **event:** fix touch detection on hybrid ([#272](https://github.com/qlik-oss/picasso.js/issues/272)) ([09b0da0](https://github.com/qlik-oss/picasso.js/commit/09b0da0))





# [0.18.0](https://github.com/qlik-oss/picasso.js/compare/v0.17.0...v0.18.0) (2018-12-04)


### Bug Fixes

* **brush-area-dir:** remove targets without rect ([#271](https://github.com/qlik-oss/picasso.js/issues/271)) ([d1e205b](https://github.com/qlik-oss/picasso.js/commit/d1e205b))
* **dock-layout:** remove components that are docked at hidden components ([#261](https://github.com/qlik-oss/picasso.js/issues/261)) ([912f26a](https://github.com/qlik-oss/picasso.js/commit/912f26a))


### Features

* **brush-area-dir:** add support for multiple fill targets ([#266](https://github.com/qlik-oss/picasso.js/issues/266)) ([2800a95](https://github.com/qlik-oss/picasso.js/commit/2800a95))
* **data:** add support for reduce label ([#268](https://github.com/qlik-oss/picasso.js/issues/268)) ([dee01ba](https://github.com/qlik-oss/picasso.js/commit/dee01ba))


### Performance Improvements

* **data:** lazy evaluate collections ([#270](https://github.com/qlik-oss/picasso.js/issues/270)) ([3c706ba](https://github.com/qlik-oss/picasso.js/commit/3c706ba))





# [0.17.0](https://github.com/qlik-oss/picasso.js/compare/v0.16.1...v0.17.0) (2018-11-27)


### Bug Fixes

* **box:** min/maxWidthPx doesnt work when scale is inverted ([#264](https://github.com/qlik-oss/picasso.js/issues/264)) ([ac729b9](https://github.com/qlik-oss/picasso.js/commit/ac729b9))
* **events:** turn off default event handlers ([#262](https://github.com/qlik-oss/picasso.js/issues/262)) ([db882b7](https://github.com/qlik-oss/picasso.js/commit/db882b7))
* **tooltip:** clamp position to component bounds ([#259](https://github.com/qlik-oss/picasso.js/issues/259)) ([2ecdf5d](https://github.com/qlik-oss/picasso.js/commit/2ecdf5d))


### Features

* **axis:** add filter overlapping labels setting ([#257](https://github.com/qlik-oss/picasso.js/issues/257)) ([d4a99cb](https://github.com/qlik-oss/picasso.js/commit/d4a99cb))
* **debug:** add support for components that use the outer rect ([#258](https://github.com/qlik-oss/picasso.js/issues/258)) ([1d04c8e](https://github.com/qlik-oss/picasso.js/commit/1d04c8e))
* dock settings as a function ([#260](https://github.com/qlik-oss/picasso.js/issues/260)) ([b923b37](https://github.com/qlik-oss/picasso.js/commit/b923b37))





## [0.16.1](https://github.com/qlik-oss/picasso.js/compare/v0.16.0...v0.16.1) (2018-11-13)

**Note:** Version bump only for package picasso.js





# [0.16.0](https://github.com/qlik-oss/picasso.js/compare/v0.15.0...v0.16.0) (2018-11-07)


### Bug Fixes

* **axis:** labels rendered outside the axis area ([#238](https://github.com/qlik-oss/picasso.js/issues/238)) ([e42f759](https://github.com/qlik-oss/picasso.js/commit/e42f759))
* **box:** out of bounds symbol arrow direction ([#245](https://github.com/qlik-oss/picasso.js/issues/245)) ([8993028](https://github.com/qlik-oss/picasso.js/commit/8993028))
* **brush:** brush only nodes with data ([#231](https://github.com/qlik-oss/picasso.js/issues/231)) ([38ce4a9](https://github.com/qlik-oss/picasso.js/commit/38ce4a9))
* **data:** undefined data source in field ([#243](https://github.com/qlik-oss/picasso.js/issues/243)) ([2ad225f](https://github.com/qlik-oss/picasso.js/commit/2ad225f))
* **layers:** preserve original index if equal ([#236](https://github.com/qlik-oss/picasso.js/issues/236)) ([a531a70](https://github.com/qlik-oss/picasso.js/commit/a531a70))
* **text:** text line height leading space ([#250](https://github.com/qlik-oss/picasso.js/issues/250)) ([707f707](https://github.com/qlik-oss/picasso.js/commit/707f707))


### Features

* expose symbol registry and factory ([#230](https://github.com/qlik-oss/picasso.js/issues/230)) ([bc9b248](https://github.com/qlik-oss/picasso.js/commit/bc9b248))
* **box-marker:** out of bounds feature for box marker ([#234](https://github.com/qlik-oss/picasso.js/issues/234)) ([31f8536](https://github.com/qlik-oss/picasso.js/commit/31f8536))
* **brush-range:** observe brush changes ([#246](https://github.com/qlik-oss/picasso.js/issues/246)) ([3b5cf0a](https://github.com/qlik-oss/picasso.js/commit/3b5cf0a))
* **scene-graph:** get parent and child nodes ([#241](https://github.com/qlik-oss/picasso.js/issues/241)) ([60615f7](https://github.com/qlik-oss/picasso.js/commit/60615f7))
* make it possible to exclude specific components from update ([#248](https://github.com/qlik-oss/picasso.js/issues/248)) ([b8c32f5](https://github.com/qlik-oss/picasso.js/commit/b8c32f5))





<a name="0.15.0"></a>
# [0.15.0](https://github.com/qlik-oss/picasso.js/compare/v0.14.0...v0.15.0) (2018-10-09)


### Bug Fixes

* **box:** add logic for minWidthPx ([#225](https://github.com/qlik-oss/picasso.js/issues/225)) ([567941e](https://github.com/qlik-oss/picasso.js/commit/567941e))


### Features

* **line:** add layer sort option ([#228](https://github.com/qlik-oss/picasso.js/issues/228)) ([b7d7e79](https://github.com/qlik-oss/picasso.js/commit/b7d7e79)), closes [#220](https://github.com/qlik-oss/picasso.js/issues/220)
* **range-brush:** add keys to dom elements ([#226](https://github.com/qlik-oss/picasso.js/issues/226)) ([f152ef6](https://github.com/qlik-oss/picasso.js/commit/f152ef6))





<a name="0.14.0"></a>
# [0.14.0](https://github.com/qlik-oss/picasso.js/compare/v0.13.3...v0.14.0) (2018-10-01)


### Bug Fixes

* update line settings ([#208](https://github.com/qlik-oss/picasso.js/issues/208)) ([8bd4619](https://github.com/qlik-oss/picasso.js/commit/8bd4619)), closes [#144](https://github.com/qlik-oss/picasso.js/issues/144)


### Features

* add debug components ([#199](https://github.com/qlik-oss/picasso.js/issues/199)) ([cbca2f1](https://github.com/qlik-oss/picasso.js/commit/cbca2f1))
* add range option for band scale ([#219](https://github.com/qlik-oss/picasso.js/issues/219)) ([0bd6b81](https://github.com/qlik-oss/picasso.js/commit/0bd6b81))
* add support for visual collision on polyline ([#198](https://github.com/qlik-oss/picasso.js/issues/198)) ([54613bd](https://github.com/qlik-oss/picasso.js/commit/54613bd))





<a name="0.13.3"></a>
## [0.13.3](https://github.com/qlik-oss/picasso.js/compare/v0.13.2...v0.13.3) (2018-09-25)

**Note:** Version bump only for package picasso.js





<a name="0.13.2"></a>
## [0.13.2](https://github.com/qlik-oss/picasso.js/compare/v0.13.1...v0.13.2) (2018-09-24)

**Note:** Version bump only for package picasso.js





<a name="0.13.1"></a>
## [0.13.1](https://github.com/qlik-oss/picasso.js/compare/v0.13.0...v0.13.1) (2018-09-20)


### Bug Fixes

* **scrollbar:** class value as string ([2df93fe](https://github.com/qlik-oss/picasso.js/commit/2df93fe))





<a name="0.13.0"></a>
# [0.13.0](https://github.com/qlik-oss/picasso.js/compare/v0.12.2...v0.13.0) (2018-09-20)


### Bug Fixes

* **scene-graph:** bounds collision with transform ([#191](https://github.com/qlik-oss/picasso.js/issues/191)) ([5fdfc7f](https://github.com/qlik-oss/picasso.js/commit/5fdfc7f))
* **scene-graph:** class selector partial match ([#190](https://github.com/qlik-oss/picasso.js/issues/190)) ([2f6bb62](https://github.com/qlik-oss/picasso.js/commit/2f6bb62))


### Features

* add filter for brush consumer ([#192](https://github.com/qlik-oss/picasso.js/issues/192)) ([62cbb74](https://github.com/qlik-oss/picasso.js/commit/62cbb74))
* check component existence before trying to create it ([#176](https://github.com/qlik-oss/picasso.js/issues/176)) ([8bda350](https://github.com/qlik-oss/picasso.js/commit/8bda350)), closes [#80](https://github.com/qlik-oss/picasso.js/issues/80)
* support functions in brush style props ([#194](https://github.com/qlik-oss/picasso.js/issues/194)) ([f776fe0](https://github.com/qlik-oss/picasso.js/commit/f776fe0))





<a name="0.12.2"></a>
## [0.12.2](https://github.com/qlik-oss/picasso.js/compare/v0.12.1...v0.12.2) (2018-08-23)

**Note:** Version bump only for package picasso.js





<a name="0.12.1"></a>
## [0.12.1](https://github.com/qlik-oss/picasso.js/compare/v0.12.0...v0.12.1) (2018-08-23)


### Bug Fixes

* use parentNode property instead of parentElement where applicable ([#173](https://github.com/qlik-oss/picasso.js/issues/173)) ([c8607fb](https://github.com/qlik-oss/picasso.js/commit/c8607fb))





<a name="0.12.0"></a>
# [0.12.0](https://github.com/qlik-oss/picasso.js/compare/v0.11.0...v0.12.0) (2018-08-22)


### Features

* **pie:** only show pie slices when outerRadius >= innerRadius ([#149](https://github.com/qlik-oss/picasso.js/issues/149)) ([fb9e93d](https://github.com/qlik-oss/picasso.js/commit/fb9e93d))
* **q:** add hierarchy support for qMode='S' ([#150](https://github.com/qlik-oss/picasso.js/issues/150)) ([9f9e33b](https://github.com/qlik-oss/picasso.js/commit/9f9e33b))
* **svg-renderer:** title attribute ([#138](https://github.com/qlik-oss/picasso.js/issues/138)) ([b35c2f8](https://github.com/qlik-oss/picasso.js/commit/b35c2f8))
* grid-line ticks strokeDasharray support ([#143](https://github.com/qlik-oss/picasso.js/issues/143)) ([c720ee7](https://github.com/qlik-oss/picasso.js/commit/c720ee7))
* stroke-linejoin ([#148](https://github.com/qlik-oss/picasso.js/issues/148)) ([4ca749d](https://github.com/qlik-oss/picasso.js/commit/4ca749d))
* tooltip ([#147](https://github.com/qlik-oss/picasso.js/issues/147)) ([c09d726](https://github.com/qlik-oss/picasso.js/commit/c09d726))





<a name="0.11.0"></a>
# [0.11.0](https://github.com/qlik-oss/picasso.js/compare/v0.10.4...v0.11.0) (2018-07-14)


### Bug Fixes

* **svg-renderer:** use quotation marks on gradient url ([#137](https://github.com/qlik-oss/picasso.js/issues/137)) ([366a687](https://github.com/qlik-oss/picasso.js/commit/366a687))


### Features

* **labels:** Change overlap handling for outside label strategy for pie slices ([#140](https://github.com/qlik-oss/picasso.js/issues/140)) ([a78328b](https://github.com/qlik-oss/picasso.js/commit/a78328b))




<a name="0.10.4"></a>
## [0.10.4](https://github.com/qlik-oss/picasso.js/compare/v0.10.3...v0.10.4) (2018-07-04)


### Bug Fixes

* **legend-cat:** Handle RTL using dir attribute ([#124](https://github.com/qlik-oss/picasso.js/issues/124)) ([0166ff3](https://github.com/qlik-oss/picasso.js/commit/0166ff3))
* **scenegraph:** allow small rounding errors in polygon detection ([#123](https://github.com/qlik-oss/picasso.js/issues/123)) ([d92f54d](https://github.com/qlik-oss/picasso.js/commit/d92f54d))




<a name="0.10.3"></a>
## [0.10.3](https://github.com/qlik-oss/picasso.js/compare/v0.10.2...v0.10.3) (2018-06-27)


### Bug Fixes

* **legend-cat:** fix disabled attribute in button ([#122](https://github.com/qlik-oss/picasso.js/issues/122)) ([0fbdf6b](https://github.com/qlik-oss/picasso.js/commit/0fbdf6b))




<a name="0.10.2"></a>
## [0.10.2](https://github.com/qlik-oss/picasso.js/compare/v0.10.1...v0.10.2) (2018-06-27)




**Note:** Version bump only for package picasso.js

<a name="0.10.1"></a>
## [0.10.1](https://github.com/qlik-oss/picasso.js/compare/0.10.0...0.10.1) (2018-06-27)


### Bug Fixes

* **labels:** Fix crash on empty labels in rows strategy ([#119](https://github.com/qlik-oss/picasso.js/issues/119)) ([e8c2b5a](https://github.com/qlik-oss/picasso.js/commit/e8c2b5a))




<a name="0.10.0"></a>
# [0.10.0](https://github.com/qlik-oss/picasso.js/compare/v0.9.0...v0.10.0) (2018-06-25)


### Bug Fixes

* **labels:** Fix label overlap in slice strategy ([#116](https://github.com/qlik-oss/picasso.js/issues/116)) ([ee5405e](https://github.com/qlik-oss/picasso.js/commit/ee5405e))
* **labels:** No rendering outside of parent rect ([#117](https://github.com/qlik-oss/picasso.js/issues/117)) ([02d773d](https://github.com/qlik-oss/picasso.js/commit/02d773d))
* **render-order:** Render components in specified order ([#114](https://github.com/qlik-oss/picasso.js/issues/114)) ([96e5114](https://github.com/qlik-oss/picasso.js/commit/96e5114))
* **scene-graph:** bounds collision ([#115](https://github.com/qlik-oss/picasso.js/issues/115)) ([6623803](https://github.com/qlik-oss/picasso.js/commit/6623803))


### Features

* **scenegraph:** add default collider on text nodes ([#108](https://github.com/qlik-oss/picasso.js/issues/108)) ([90c8848](https://github.com/qlik-oss/picasso.js/commit/90c8848))




<a name="0.9.0"></a>
# [0.9.0](https://github.com/qlik-oss/picasso.js/compare/v0.8.0...v0.9.0) (2018-06-14)


### Bug Fixes

* **dom-renderer:** clear vnode on destory ([#89](https://github.com/qlik-oss/picasso.js/issues/89)) ([406780f](https://github.com/qlik-oss/picasso.js/commit/406780f))
* legend-cat formatter ([#97](https://github.com/qlik-oss/picasso.js/issues/97)) ([1612c82](https://github.com/qlik-oss/picasso.js/commit/1612c82))
* **label-strategy:** Fix error when using rows strategy on non circle slices ([#99](https://github.com/qlik-oss/picasso.js/issues/99)) ([e22a36c](https://github.com/qlik-oss/picasso.js/commit/e22a36c))
* **labels:** ellipsed text in bars strategy ([#87](https://github.com/qlik-oss/picasso.js/issues/87)) ([ff4e11d](https://github.com/qlik-oss/picasso.js/commit/ff4e11d))
* **layout:** do not re-position components on partial data update ([#104](https://github.com/qlik-oss/picasso.js/issues/104)) ([54ee8f2](https://github.com/qlik-oss/picasso.js/commit/54ee8f2))
* **legend-cat:** Remove commented import ([#96](https://github.com/qlik-oss/picasso.js/issues/96)) ([be21b18](https://github.com/qlik-oss/picasso.js/commit/be21b18))
* **scene-node:** append all component meta ([#105](https://github.com/qlik-oss/picasso.js/issues/105)) ([62d7fb0](https://github.com/qlik-oss/picasso.js/commit/62d7fb0))


### Features

* **brush-trigger:** Component level flag to disable brush triggers ([#90](https://github.com/qlik-oss/picasso.js/issues/90)) ([f398060](https://github.com/qlik-oss/picasso.js/commit/f398060))
* **label-strategy:** Rows label strategy ([#81](https://github.com/qlik-oss/picasso.js/issues/81)) ([ca35ece](https://github.com/qlik-oss/picasso.js/commit/ca35ece))
* **legend-cat:** legend cat expose scroll offset ([#93](https://github.com/qlik-oss/picasso.js/issues/93)) ([c38d284](https://github.com/qlik-oss/picasso.js/commit/c38d284))
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
* **renderer:** reset scene when clearing render ([#47](https://github.com/qlik-oss/picasso.js/issues/47)) ([3793443](https://github.com/qlik-oss/picasso.js/commit/3793443))


### Code Refactoring

* callback argument on scale settings ([#36](https://github.com/qlik-oss/picasso.js/issues/36)) ([ce6b0f5](https://github.com/qlik-oss/picasso.js/commit/ce6b0f5))


### Features

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
