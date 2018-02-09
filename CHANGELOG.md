# Changelog

## **0.41.0** - *(2017-12-21)*

### Added

- Axis: add support to align label along main axis ([#572](https://github.com/qlik-trial/picasso.js/issues/572))

  ```js
  {
    type: 'axis',
    settings: {
      labels: {
        align: 0.5
      }
    }
  }
  ```

- Normalize axis/grid-line setting and support style definition

  ```js
  {
    type: 'axis',
    settings: ...,
    style: {
      ticks: '$guide-line',
      minorTicks: '$minor-guide-line',
      labels: '$label',
      line: '$guide-line'
    }
  },
  {
    type: 'grid-line',
    settings: ...,
    style: {
      ticks: '$guide-line',
      minorTicks: '$minor-guide-line',
    }
  }
  ```

### Updated

- More examples added
- jsdoc changes to fix spec output

## **0.40.0** - *(2017-12-12)* [BREAKING]

### Added

- Linear scale: allow custom ticks with start, end and label ([#576](https://github.com/qlik-trial/picasso.js/issues/576))

  ```js
  scale: {
    ticks: {
      values: [
        { value: 3, start: 2, end: 4, label: '3kr' },
        { value: 6, start: 5, end: 7, label: '6kr' }
      ]
    }
  }
  ```

- Filter data on extraction [#598](https://github.com/qlik-trial/picasso.js/pull/598)

### BREAKING

- This project is now a proper multi-package repository, the following packages are published on each release:
  - `@qlik/picasso`
  - `@qlik/picasso-plugin-q`
  - `@qlik/picasso-plugin-hammer`

    **Migration**

    The plugins were previously included as part of the main `@qlik/picasso` package, but are now independent packages:

    ```js
    // old
    import picassoHammer from '@qlik/picasso/plugins/hammer';
    import picassoQ from '@qlik/picasso/plugins/q';

    // new
    import picassoHammer from '@qlik/picasso-plugin-hammer';
    import picassoQ from '@qlik/picasso-plugin-q';
    ```

## **0.39.2** - *(2017-12-04)*

### Fixed

- Legend-cat: Doesn't handle floating point number as scrollLength input to tap/scroll events ([#588](https://github.com/qlik-trial/picasso.js/issues/588))
- Triangle symbol is generated incorrectly for left/right direction ([#586](https://github.com/qlik-trial/picasso.js/issues/586))

## **0.39.1** - *(2017-11-30)*

### Fixed

- PIC-239 Legend arrows hit area to small

## **0.39.0** - *(2017-11-29)*

### Fixed

- PIC-237 - Brush action 'tap' does not work on touch devices

### Added

- Exposed `version` on `picasso` namespace
- Exposed `module` in `package.json` in order to allow module bundlers to consume picasso as en es6+ module


## **0.38.0** - *(2017-11-23)*

### Fixed

- h-band scale doesn't properly calculate values when pixel scaling ([#563](https://github.com/qlik-trial/picasso.js/issues/563))
- Legend-cat: Scroll buttons should swap places when anchor is set to `right` and in vertical mode ([#565](https://github.com/qlik-trial/picasso.js/issues/565))
- Path doesn't work in Edge with canvas renderer ([#567](https://github.com/qlik-trial/picasso.js/issues/567))

### Added

- Find field by function

  ```js
  // find a field that has 'colorByAlternative' as id
  const c = ds.field(f => f.raw().id === 'colorByAlternative');
  c && console.log(c.key()); // 'qDimensionInfo/1/qAttrDimInfo/1
  ```

## **0.37.0** - *(2017-11-20)*

### Added

- Experimental support for multiple columns/rows in categorical legend `legend-cat`

  ```js
    {
      type: 'legend-cat',
      settings: {
        direction: 'vertical',
        layout: {
          mode: 'table', 
          size: 2 // Only enabled in table mode. Is either row or column count, depending on the directional setting.
        }
      }
    }
  ```
- PIC-217 - [Labeling strategy](./docs/dist/components/labels.md) for horizontal bars ([#562](https://github.com/qlik-trial/picasso.js/pull/562))

### Fixed

- PIC-231 - Labels not formatted according to field formatter ([#552](https://github.com/qlik-trial/picasso.js/pull/552))
- tree accessor does not return data ([#557](https://github.com/qlik-trial/picasso.js/pull/557))
- weird align/justify in categorical legend ([#542](https://github.com/qlik-trial/picasso.js/issues/542))

### Changed

- Brush events are now properly delegated ([#556](https://github.com/qlik-trial/picasso.js/issues/556))

## **0.36.1** - *(2017-11-03)*

### Fixed

- PIC-230 - Error on empty stacked hypercube

## **0.36.0** - *(2017-11-02)*

### Added

- Apply style configuration in `point-marker`

### Fixed

- PIC-226 - Can't extract data from multiple cubes
- PIC-227 - `source.key` is missing when extracting data from K mode
- PIC-228 - `trackBy` doesn't work in K mode

## **0.35.0** - *(2017-11-01)* [BREAKING]

### Added

- Raw data accessor on `field` instance ([#524](https://github.com/qlik-trial/picasso.js/issues/524))

### Fixed

- PIC-222 - Error thrown when providing `source` in `formatters` configuration ([#527](https://github.com/qlik-trial/picasso.js/pull/527))
- PIC-224 - Box placement ignores `maxPxStep` setting on major scale
- #516 Box-marker doesn't handle when start or end value is null
- PIC-223 Error in categorical legend on partial update
- PIC-225 Warning for missing key is wrong

### Breaking

- Argument to function callbacks in `labels` component have changed, see [#519](https://github.com/qlik-trial/picasso.js/pull/519) on how to migrate

## **0.34.0** - *(2017-10-30)* [BREAKING]

### Added

- PIC-219 Change the size of legend arrows
- PIC-215 Multi-line text support on categorical legend

  ```js
  // See API ref for full set of available settings
  {
    type: 'legend-cat',
    settings: {
      item: {
        label: {
          wordBreak: 'break-word' // Define word break rule for each item label
        }
      },
      title: {
        wordBreak: 'break-word' // Define word break rule for the legend title
      }
    }
  }
  ```
- `line` component *[experimental]*, see [line component](./docs/dist/components/line.md)
- data collections, see [PR 497](https://github.com/qlik-trial/picasso.js/pull/497)
- data stacking, see [PR 498](https://github.com/qlik-trial/picasso.js/pull/498)

### Fixed

- Instancing a new picasso without arguments no longer throws undefined, i.e. `picasso({})` -> `picasso()`
- `main` added in package.json, you can now do `import picasso from '@qlik/picasso';` instead of typing `dist/picasso.min.js`
- PIC-216 Axis shows duplicate values for different ticks

### Breaking changes

- Component specific settings for `legend-seq` have been move from root component definition to root.settings

  ```js
  // See API ref for full set of changes
  {
    type: 'legend-cat',
    dock: 'left',
    scale: 'colorScale',
    settings: {
      anchor: 'left' // Renamed to anchor instead of align
    }
  }
  ```

## **0.33.0** - *(2017-10-13)* [BREAKING BREAKING BREAKING]
### Breaking

- Data configuration - see [pull/481](https://github.com/qlik-trial/picasso.js/pull/481)
## **0.32.0** - *(2017-10-05)* [BREAKING]

### Added

- PIC-208 - Style resolver - experimental API not yet exposed
- PIC-209 - Configuration of a custom picasso namespace, see [picasso.md](./docs/dist/picasso.md)
- PIC-210 - `pie` component, see [pic.md](./docs/dist/components/pie.md)
- PIC-211 - Text node in SVG should use white-space pre to mimic canvas white space behavior
- PIC-213 - Theme palette resolver - experimental API not yet exposed
- Added `rect:disabled` and `symbol:disabled` to the buttons for styling disabled buttons (paging up/down not available)
- PIC-199 Added support for multi-line text on title in `legend-seq`

  ```js
  {
    type: 'legend-seq',
    settings: {
      title: { 
        text: 'ALL YOUR BASES BELONG TO US',
        wordBreak: 'break-word' // Or break-all, defaults to none
      }
    }
  }
  ```

### Fixed

- State on `legend-cat` component not preserved when using chart.update

### Breaking changes

- `buttons.show` on `legend-cat` now defaults to `false` instead of `true`

## **0.31.0** - *(2017-09-21)*

### Added

- PIC-206 - Add alias support for brush keys

  ```js
  brush.addKeyAlias('BadFieldName', 'Region');
  brush.addValue('BadFieldName', 'Sweden'); // 'BadFieldName' will be stored as 'Region'
  brush.containsValue('Region', 'Sweden'); // true
  brush.containsValue('BadFieldName', 'Sweden'); // true
  ```

## **0.30.1** - *(2017-09-20)*

### Changed

- Brush value action is triggered even if there are no items currently being brushed
  - This is a revert of a change done in `v0.30.0`

## **0.30.0** - *(2017-09-19)*

### Added

- PIC-203 - Selections in threshold legend
- PIC-204 - Range brush manipulation

### Fixed

- PIC-194 - Callback methods in component properties lose their context after `chart.update()`

## **0.29.0** - *(2017-09-18)*

### Added

- PIC-202 - Track a scales' domain by a field's `qElemNumber` values:

  ```js
  {
    scales: {
      color: {
        source: '/qHyperCube/qDimensionInfo/0',
        type: 'color'
        trackBy: 'id' // default: 'label'
      }
    }
  }
  ```

## **0.28.1** - *(2017-09-15)*

### Fixed

- PIC-200 legend-cat title show false bugfix

## **0.28.0** - *(2017-09-11)*

### Added

- PIC-38 Legend component for sequential color scale

  ```js
  {
    type: 'legend-seq',
    dock: 'top', 
    settings: {
      fill: 'colorScale',
      major: 'measureScale',
      ticks: {
        label: (val, i, ary) => {
          let temp = ['Cold', 'Hot'];
          return temp[i % 2];
        },
      },
      title: { 
        text: 'ALL YOUR BASES BELONG TO US'
      }
    }
  }
  ```

- PIC-195 Add ID attribute to enable css selection by ID

  ```js
  chartInstance.findShapes('[id="myNodeId"]');
  ```
  
- PIC-179 Varying symbols in color legend

  ```js
  {
    type: 'legend-cat',
    item: {
      shape: function(a, i) { // As a function
        return {
          type:  'star',
          fill: this.data.color,
          points: 2 // Custom shape property only applicable to the "star" is valid here
        };
      },
      shape: { // As an object
          type: 'star',
          stroke: 'black',
          strokeWidth: 2,
          points: function(a, i) { return i + 1 },
        }
      shape: 'n-polygon' // As a string
  }
  ```

- PIC-192 Scrollable categorical color legend

  ```js
  {
    type: 'legend-cat',
    buttons: { // Scrolling buttons.
      show: true, // Show the scroll/paging buttons (will still auto hide when not needed). Default: true. Optional.
      rect: { // Settings for the rect of the buttons. Optional.
        fill: 'transparent', // Fill color. Default: 'transparent'. Optional.
        stroke: 'grey', // Stroke color. Default: 'grey'. Optional.
        strokeWidth: 1, // Stroke width in pixels. Default: 1. Optional.
      },
      symbol: { // Settings for the symbol of the buttons. Optional.
        fill: 'grey', // Symbol fill color. Default: 'grey'. Optional.
        stroke: 'grey', // Stroke color. Default: 'grey'. Optional.
        strokeWidth: 2, // Stroke width in pixels. Default: 2. Optional.
      },
   },
  }
  ```


## **0.26.0** - *(2017-08-24)* [BREAKING]

### Fixed

- PIC-190 Area range label is wrong when dragging for the first time

### Breaking changes

- Changed default behaviour of 'box-marker' box properties 'maxWidth' and 'minWidth', added 'minHeightPx'

    ```js
    // old
    maxWidth: 100,
    minWidth: 5,
    
    // new
    maxWidthPx: 100,
    minWidthPx: 1,
    minHeightPx: 1,
    ```
    
### Fixed

- PIC-193 - Mis-alignment of whiskers and lines in box marker

## **0.25.0** - *(2017-07-05)* [BREAKING]

### Added

- Optimized the way a component which consumes a brush is re-rendered - now re-renders only when the brushed state of a shape changes

### Breaking changes

- PIC-185 - Accept more expressiveness in categorical color legend

    ```js
    // 'items' in 'legend-cat' has been renamed to 'item'
    
    // old
    {
      type: 'legend-cat',
      items: {
        margin: 5
      }
    }
    
    // new
    {
      type: 'legend-cat',
      item: {
        margin: 5
      }
    }
    ```

- PIC-149 - Whisker width is now relative to box instead of bandwidth

    ```js
    // old
    box: { width: 0.5 }, // box is half the width of bandwidth
    whisker: { width: 0.25 } // whisker is 1/4 the width of bandwidth, or half of boxes width

    // new
    box: { width: 0.5 }, // box is half the width of bandwidth
    whisker: { width: 0.5 } // whisker is half the width relative to box
    ```

### Build

- Changed to `rollup` as build tool
  - This might re-introduce issue SUI-507

## **0.24.0** - *(2017-06-28)*

### Added

- PIC-178 - Static categorical color legend
  - See [legend-cat](./docs/dist/components/legend-cat.md)
- PIC-157 - Layout alignment for scaled charts
  - See `dockLayout.logicalSize.align` property in [dock-layout](./docs/dist/dock-layout.md)

### Fixed

- PIC-182 - Range selection for measure does not include multiple options

## **0.23.0** - *(2017-06-22)*

### Added

- PIC-176 - Discrete range selection based on shapes
  - See [brush-area-dir](./docs/dist/components/brush-area-dir.md)

## **0.22.1** - *(2017-05-31)*

### Fixed

- Error thrown in `ref-line` component when trying to render a line without a label, whose value is out of bounds

## **0.22.0** - *(2017-05-31)* [BREAKING] 

### Added

- PIC-175 - Enable ref-line oob tooltip

### Fixed

- PIC-174 - Box plot bars disconnected with min/max on scale
- PIC-177 - Range selection bubbles should display labels instead of id

### Breaking changes

- PIC-173 - Change `SceneObject` property `data` to `dataIndex`
  - Calls to `getAffectedShapes`, `findShapes` and `shapesAt` on the chart instance return an array of `SceneObject`s, this object holds a `data` property which has been renamed to `dataIndex`, any references to it need to be updated.

## **0.21.2** - *(2017-05-31)*

### Fixed

- Error thrown when trying to do a range selction on a band scale
- `dom-renderer` is missing `findShapes` method
- brush `containsMappedData` logic exits too early when a mapped data object is missing source data

## **0.21.1** - *(2017-05-29)*

### Fixed

- `strokeDasharray` property is not working in canvas context

## **0.21.0** - *(2017-05-24)* [BREAKING]

### Added

- PIC-159 - More shapes in marker components
- PIC-165 - Color coding bars based on value
- PIC-169 - Capability to create 'bridge' between bars

### Fixed

- PIC-164 - Console error on brush-range target when component is hidden
- PIC-167 - Different dimension values map to the same position

### Breaking changes

- Text component definition has been updated and some properties are no longer possible to set in both the root defintion and in the settings property

    ```js
    {
      type: 'text',
      anchor: 'left', // Moved to settings
      maxWidth: 12, // Removed
      style: { fill: 'red' }, // Moved to settings
      join: ';', // Moved to settings
      paddingStart: 12, // Moved to settings
      paddingEnd: 12, // Moved to settings
      paddingLeft: 12, // Moved to settings
      paddingRight: 12, // Moved to settings
      settings: {
        paddingStart: 12, // Still valid
        paddingEnd: 12, // Still valid
        paddingLeft: 12, // Still valid
        paddingRight: 12, // Still valid
        anchor: 'left', // Still valid
        maxLengthPx: 12, // Replaced maxWidth
        style: { fill: 'red' }, // Still valid
        join: ';', // Still valid
      }
    }
    ```

- Change discrete range select to keep existing selections and only add values added to the range and remove values leaving the range when it changes.
  - setValues interceptor -> addValues & removeValues interceptor
  - set-values event -> add-values & remove-values event

## **0.20.4** - *(2017-05-15)*

### Fixed

- patternSeparator in qs-number-formatter in q-plugin is now fixed set to ';' instead of localeInfo.qListSep

## **0.20.3** - *(2017-05-09)*

### Fixed

- Bounds for labels rect mismatch the coordinate system of the scene object bounds

## **0.20.2** - *(2017-05-09)*

### Fixed

- Local bounds for scene objects are divided by dpi value

## **0.20.1** - *(2017-05-08)*

### Fixed

- QSFormatter formats wrong when `qType='I'` and format pattern has a decimal part

## **0.20.0** - *(2017-05-08)*

### Added

- PIC-115 - Interaction manager
- PIC-74 - Option to disable interactivity
- Hover effect on brush range target area

### Changed

- A brushed range can now only be moved/created within the target area, if such is specified.

### Fixed

- Error in number formatter when formatting numeric strings
- Bad number formatting when localeInfo object is empty
- Median line in box-plot renders poorly

### Deprecated

- `interaction` component has been deprecated and replaced with `settings.interactions`

## **0.19.0** - *(2017-05-05)*

### Added

- PIC-20 - Labeling strategy for vertical bars
  - See [labels documentation](./docs/dist/components/labels.md)
- PIC-144 - Allow the size ratio of the central dock area to be configured
  - See [dock-layout documentation](./docs/dist/dock-layout.md)

### Fixed

- PIC-150 - Wrong default align if docked at top right
- PIC-151 - Scales ref start/end not inverted when scale is inverted
- PIC-152 - Brush range visual style
- PIC-153 - Ref line labels disappear when aprt of label is outside dock area
- Box markers now align properly to axis and themselves (no 1px diff/off)

## **0.18.4** - *(2017-04-28)*

### Fixed

- PIC-132 - Poor accuracy when calculating overlapping labels in preferedSize
- PIC-138 - Circle Line collision test fails when it shouldn't
- PIC-145 - Picasso becomes unresponsive when trying to render really long labels
- PIC-146 - Support rendering scroll bar when it is very small (e.g. less than 0.5 pixel)

## **0.18.3** - *(2017-04-26)*

### Fixed

- wrong version in `package.json`

## **0.18.2** - *(2017-04-26)* [YANKED]

_Yanked due to `package.json` not having correct version in tagged commit_

### Fixed

- PIC-143 shapesAt doesn't work for containers with bounds collider

## **0.18.1** - *(2017-04-25)*

### Removed

- PIC-115 Support for binding native events with interaction component

## **0.18.0** - *(2017-04-25)* [BREAKING][YANKED]

### Breaking changes

- Updated scrollbar to expect delegated hammer events.
See updated example in picasso-sandbox for how to use

### Added

- PIC-115 Support for binding native events with interaction component

### Fixed

- Selecting correct values for discrete range selection on multi-dimensional hypercube
- PIC-135 PrioOrder doesn't work as expected

## **0.17.0** - *(2017-04-20)*

### Added

- Support range brush on band scale

### Fixed

- PIC-137 Axis always disappear if dock is updated from horizontal to vertical

## **0.16.1** - *(2017-04-19)*

### Fixed

- PIC-136 EventEmitter mem leak

### Internal

- Performance improved for QIX data transformations

## **0.16.0** - *(2017-04-19)* [BREAKING]

### Breaking changes

- chart definition and component definitions no longer accept `on` property to bind events when instantiating a new instance or when update an existing one. Instead events can be bound in the `mounted` hook.

    ```js
    picasso.chart({
      element,
      data,
      settings: {
        components: [
          {
            on: { // Removed
              ...
            }
          }
        ]
      },
      on: { // Removed
        ...
      }
    })
    ```

- ref-line's `style` property has been renamed to `line`:

    Old:
    ```js
    lines: {
      x: [{
        value: 0.2,
        style: {
          stroke: 'green',
          strokeWidth: 2
        },
      }]
    }
    ```

    New:
    ```js
    lines: {
      x: [{
        value: 0.2,
        line: {
          stroke: 'green',
          strokeWidth: 2
        },
      }]
    }
    ```

### Added

- PIC-7 Continuous range selection
- PIC-8 Lasso selection
- PIC-133 Enable user to do lookup on shapes by using a geometrical shape as input

    ```js
    chartInstance.shapesAt(
      { x: 100, y: 100, width: 100, height: 100 },
      {
        components: [
          { key: 'key1', propagation: 'stop' },
          { key: 'key2' }
        ],
        propagation: 'stop'
      }
    );
    ```

- PIC-134 Enable user to brush on data bound shapes (nodes)

    ```js
    chartInstance.brushFromShapes(shapes
      {
        components: [
          {
            key: 'key1',
            contexts: ['myContext'],
            data: ['self'],
            action: 'add'
          }
        ]
      }
    );
    ```

- PIC-124 Detect lasso selection 'action'


## **0.15.0** - *(2017-04-11)* [BREAKING]

### Breaking changes

- `minSize` and `maxSize` settings in the `point-marker` component have been moved and renamed:

    Old:
    ```js
    settings: {
      maxSize: 100,
      minSize: 5
    }
    ```

    New:
    ```js
    settings: {
      sizeLimits: {
        maxPx: 500,
        minPx: 1
      }
    }
    ```

### Added

- Reference lines component

### Fixed

- PIC-114 - Ratio between box and outlier is not kept

## **0.14.0** - *(2017-04-06)* [BREAKING]

### Breaking changes

- Removed `propagation` option `data` from brush trigger. The default behavior is now as if data was option was set.

    ```js
    brush: {
      trigger: [{
        propagation: 'data' // Removed
      }]
    }
    ```

### Added

- Support for dimension range brush

### Fixed

- PIC-120 Property displayOrder of text component should be set to default value instead of 99
- PIC-126 Brush over doesn't trigger update if no collisions occur
- PIC-127 Brush setValues doesn't handle unique values properly
- PIC-129 Bounding rect of a line should never have a height or width of zero

## **0.13.0** - *(2017-03-31)* [BREAKING]

### Breaking changes

- Removed `layered` & `tilted` properties from `axis` component and replaced them with a `mode` property taking either `auto`, `horizontal`, `layered` or `tilted`

    ```js
    {
      type: 'axis',
      settings : {
        labels: {
          mode: 'tilted' // Default is auto
        }
      }
    }
    ```

### Added

- PIC-117 Automagically switch to tilted labels when appropriate
- Added `maxGlyphCount` on axis component.

    ```js
    {
      type: 'axis',
      settings : {
        labels: {
          maxGlyphCount: 20
        }
      }
    }
    ```

### Fixed

- PIC-119 Update doesn't trigger re-resolving of scale type
- PIC-122 Batch brush items

## **0.12.4** - *(2017-03-17)*

### Fixed

- PIC-113 globalPropagation property doesn't work on brush trigger

## **0.12.3** - *(2017-03-17)*

### Fixed

- PIC-112 - Discrete axis doesn't hide when labels overlap
- Event handlers for brush stylers are not cleared during update

## **0.12.2** - *(2017-03-16)*

### Fixed

- q plugin exports don't work in AMD

## **0.12.1** - *(2017-03-16)*

- ?

### Fixed

- PIC-112 Discrete axis doesn't hide when labels overlap

## **0.12.0** - *(2017-03-15)* [BREAKING]

### Breaking changes

- Move `q` on the public API into a separate plugin. This change requires registering of the `q` plugin to make it available. Also, the brush helper function has been renamed.

  _Usage in ES2015_

    ```js
    import picasso from '@qlik/picasso';
    import q, { qBrushHelper } from '@qlik/picasso/plugins/q';

    picasso.use(q);

    qBrushHelper(/* ... */);
    ```

  _Usage in AMD_

    ```js
    define(['@qlik/picasso', '@qlik/picasso/plugins/q/dist/picasso-q'], function(picasso, q) {
      picasso.use(q);

      qBrushHelper(/* ... */);
    });
    ```

- Initializing formatters, data etc. has changed from picasso.data('q')()(data) to picasso.data('q')(data).
- Scale types have changed name (if any of the following are used explicitly, they need to be updated):
  - `ordinal` → `band`
  - `color-threshold` → `threshold-color`
  - `color-sequential` → `sequential-color`

### Added

- PIC-4 Categorical color scale
- PIC-6 QIX attribute dimension support
- PIC-104 Control visibility of components

    ```js
    components: [
      {
        type: 'axis',
        show: false
      }
    ]
    ```

- Expose the following methods on the public API: `formatter`, `dataset`, `field` and `table`.
- Flatten formatters (keeping backward compatibility). Example: `picasso.formatter('d3')('number')` → `picasso.formatter('d3-number')`.


## **0.11.0** - *(2017-03-07)* [BREAKING]

### Breaking changes

- scale ticks settings `count` & `values` now only accept primitive numbers:

    ```js
    scales: {
      x: {
        ticks: {
          count: 5,
          values: [1, 2, 3, 4, 5]
        },
        minorTicks: {
          count: 3
        }
      }
    }
    ```

### Fixed

- PIC-55 Can crash browser by setting a short ticks distance
- PIC-96 Tooltips doesn't align correctly for canvas

### Added

- PIC-2 Sequential scale
- PIC-3 Threshold color scale

## **0.10.0** - *(2017-02-28)* [BREAKING]

### Breaking changes

- brushing: the `action` in brush triggers now refers to which action to run `on` event:

    ```js
    trigger: [{
      on: 'tap',
      action: 'set'
    }]
    ```

### Added

- PIC-82 Default to bounds container collider on box-marker
- PIC-85 Add trigger options for different actions

    ```js
    action: 'set' // Sets the brushed values, replacing any previous ones (default for hover brush)
    action: 'toggle' // Toggles the brushed values, adding and removing from the brush (default for tap brush)
    action: 'add' // Adds the brushed values
    action: 'remove' // Removes the brushed values
    action: function(e) { return e.ctrlKey ? 'set' : 'toggle' }
    ```

### Fixed

- PIC-83 'click' trigger at start of gesture

## **0.9.2** - *(2017-02-23)*

### Fixed

- dom-renderer clear method

### Added

- PIC-84 Add interceptor removal methods:

    ```js
    brush.removeAllInterceptors('toggle-values');
    brush.removeAllInterceptors();
    ```

## **0.9.1** - *(2017-02-22)*

### Fixed

- Box-marker without major scale falls back to `minWidth` setting due to `bandwith` defaulting to `0` - should default to `1`

## **0.9.0** - *(2017-02-21)* [BREAKING]

### Breaking changes

- `chart.getAffectedShapes()` now returns an array of `sceneObjects`
- `attribute` has changed name to `trackBy` in `data.mapTo.groupBy`
- `type: 'qual:id'` has been removed in favor of `property: 'id'`
- Settings for generating ticks has been moved to the scale instead

### Added

- PIC-25 Sense selections by row and column:

    ```js
    data: {
      mapTo: {
        groupBy: '/qDimensionInfo/1', trackBy: '$index', property: '$index'
      }
    }

    picasso.brush(chart.brush('selection', { byCells: true }))
    ```

- PIC-60 Basic sequential color scale:

    ```js
    fill: {
      ref: 'a',
      scale: {
        source: '/qHyperCube/qDimensionInfo/0/qAttrExprInfo/0',
        type: 'color-sequential',
        range: ['darkred', 'orange', 'green']
      }
    }
    ```

- PIC-64 `chart.findShapes()` takes a css selector and return shapes in a chart, as an array of `sceneObjects`

    ```js
    chart.findShapes('circle');
    chart.findShapes('circle[fill="red"]');
    ```

- PIC-67 Basic quantized color scale:

    ```js
    fill: {
      ref: 'a',
      scale: {
        source: '/qHyperCube/qDimensionInfo/0/qAttrExprInfo/0',
        type: 'color-threshold',
        range: ['red', 'green', 'blue'],
        domain: [100, 200]
      }
    }
    ```

- PIC-70 Support for attribute expressions on measures and dimensions:

    ```js
    source: '/qHyperCube/qMeasureInfo/1/qAttrExprInfo/0'
    ```

- PIC-77 Values are abbreviated when format type is inconclusive


### Fixed

- Ordinal scale does not use provided settings
- Ordinal scale changed to behave as a band scale
- Components respect the ordinal scale properly and use bandwidth to handle default sizing
- PIC-72 Components do not update dock property
- PIC-75 `NaN` values on measures messes up the min/max on the scale
- PIC-43 When less then half of a label is visible then the axes will not be visible

## **0.8.0** - *(2017-02-15)*

### Added

- Support for touch/hybrid when brushing
- Optional setting to control touch area:

     ```js
     trigger: [{
       contexts: [],
       action: 'tap',
       touchRadius: 24
     }]
     ```

### Fixed

 - PIC-69 EffectiveInterColumnSortOrder not taken into account

## **0.7.0** - *(2017-02-06)* [BREAKING]

### Breaking changes

- Box marker's scales has changed from x to major and y to minor. The vertical parameter has been replaced with "orientation" with possible values "vertical" and "horizontal". Defaults to vertical.

### Added

- Allow creation of scales without data source

### Fixed

- Some brushing issues has been fixed

## **0.6.0**

### Added

- Scrollbar component
- Partial update flag
- Brush support on SVG and Canvas renderer.
- Brush through multiple layers of components. Control propagation via optional settings:

    ```js
    trigger: [{
      contexts: [],
      action: 'tap',
      propagation 'stop', // 'stop' => only trigger on first shape || 'data' => only trigger on shapes with unique data values
      globalPropagation: 'stop', // 'stop' => if triggered, do not run triggers on other components
    }]
    ```

### Fixed

- QLIK-70268 Width/Size are not in sync nor logical
- QLIK-70627 Ratio between point and box are not kept
- QLIK-71779 Labels on top of each other if "forced axis values" close to each others are used in the wrong order
- QLIK-72315 forceBounds setting should filter neighbor if it's to close
- QLIK-72348 Update chart from layered true to false renders the axis wrong
- QLIK-72378 Update data in the update chart example sometimes makes the x axes disappear and it will never come back
- Formatter source lookup on dataset


## **0.5.0** - *(2017-01-24)*

### Added

- Support for qHyperCube in "K" mode
- Support primitive values in data mapping:

    ```js
    data: {
      mapTo: {
        start: 0,
        parent: 'Zeus'
      }
    }
    ```

- Support brushing in discrete axis

### Fixed

- Crash when traversing 'null'
- Grid lines actually work again, a basic grid line can be added to components like this:

    ```js
    {
      type: 'grid-line',
      x: { scale: 'x' },
      y: { scale: 'y' }
    }
    ```
- Crispifier now produces non-fuzzy rects even if the strokeWidth is even
- "Sponge-effect" bug in the boxplot has been removed

## **0.4.1**

### Changes

- Transpile es6 versions of d3 modules

## **0.4.0** - *(2016-01-16)* [BREAKING]

### Breaking changes

- `picasso.chart` now takes an object as its single parameter

    ```js
    // before
    var settings = {
      components: {
        markers: [
          type: 'box',
          settings: {
            dock: 'left',
            anotherSetting: 'x'
          }
        ]
      }
    };
    picasso.chart(element, data, settings);

    //after
    var settings = {
      components: [
        type: 'box-marker',
        key: 0, // unique identifier per component to improve performance on update
        dock: 'left',
        settings: {
          anotherSetting: 'x'
      }
    ]
    };
    var chartInstance = picasso.chart({
      element: element,
      data: data,
      settings: settings
    }};
    ```

- `components` is now a flat array
- `dock` property has been moved out one level (the same applies for `displayOrder` and `prioOrder`)

### Added

- DOM renderer
- `update` method on the chart instance can be used to update settings and/or data

   ```js
   var pic = picasso.chart({...});
   pic.update({
     data: {...}
   });
   ```

- Event listeners can be bound on component and chart level

    ```js
    {
      type: 'point-marker',
      on: {
        click: function() {
          console.log('clicked');
        }
      }
    }
    ```

- Lifecycle hooks on components:

    ```js
    {
      type: 'point-marker',
      created: () => {},
      mounted: () => {},
      beforeRender: () => {},
      beforeUpdate: () => {},
      updated: () => {},
      beforeDestroy: () => {},
      destroyed: () => {}
    }
    ```

- Brushing supported by components:

    ```js
    {
      type: 'point-marker',
      data: {...},
      settings: {...},
      brush: {
        trigger: [{
          action: 'tap',
          contexts: ['highlight']
        }],
        consume: [{
          context: 'highlight',
          style: {
            inactive: {
              opacity: 0.3
            }
          }
        }]
      }
    }
    ```

- Data brushing API

    ```js
      var pic = picasso.chart(...);
      pic.brush('highlight').addValue('products', 'Bike');
    ```

## **0.3.0** - *(2016-12-20)* [BREAKING]

### Added

- Scale settings
  - Expand
  - Include
- Null data fallback
- Data mapping
- Crispifier
  - Crisp setting for transposer
- Documentation
- RTL text rendering and ellipsis
- Style inheritance

### Changed

- [BREAKING] - Marker configurations

### Fixed

- Scale invert now works as it is supposed to
- Scale with same min and max automatically expands the values to ensure a range exists
- Stroke-width works as intended on canvas

## **0.2.0** - *(2016-10-24)* [BREAKING]

### Added

- Axis component
- Box marker component
- Improved point marker component
- Canvas rendering

### Changed

- [BREAKING] Point marker configuration

## **0.1.0** - *(2016-06-30)*

- Initial release
