> HammerJS has to be loaded to be able to use this plugin so that the Hammer variable is
available on the global namespace

# `hammer` interaction component

A interaction component that binds events using HammerJS.
This plugin provides an api for binding HammerJS recognizers to the chart element
in a declaritive way. The documentation for the Hammer API is available [here](http://hammerjs.github.io/api/)

## How to use

```sh
npm install picasso-plugin-hammer
```

```js
import picassoHammer from 'picasso-plugin-hammer';

picasso.use(picassoHammer);
```

## Hammer interaction settings

```js
interactions: [{
  type: 'hammer',
  key: 'here',
  enable: function() {  // bool or function that runs when interactions are added, not every event loop
    this.chart /*...*/;
    return true;
  },
  gestures: [{
    type: 'Pan', // required - Point out which hammer recognizer that should be used
    options: { // optional - Options for hammer Pan recognizer
      /**
      * Determines if this gestures should be enabled or not, Runs every event loop that Hammer processes
      */
      enable: function() {
        this.chart /*...*/;
      },
      event: 'thePan', // optional - name the event this gestures should trigger defaults to 'pan' in this case
      ... // Pan options are described here http://hammerjs.github.io/recognizer-pan/
    },
    recognizeWith: 'otherEvent1 otherEvent2', // space separated list of recognizers that should run simultaneously. The name is the event name specified in the options of the gesture (or the default name)
    requireFailure: 'otherEvent', // space separated list of recognizers that needs to fail before this one gets recognized. The name is the event name specified in the options of the gesture (or the default name)
    events: {
      /**
      * When hammer recognizes that a pan gesture begins the event specified in
      * the options object above with 'start' added is emitted.
      */
      thePanstart: function(e) {
        // handle event for pan start
      },
      /**
      * When hammer recognizes a pan gesture the event specified in the options object
      * above with is emitted.
      */
      thePan: function(e) {
        // handle event for panning
      },
      /**
      * When hammer recognizes that a pan gesture ends the event specified in
      * the options object above with 'end' added is emitted.
      */
      thePanend: function(e) {
        // handle event for pan end
      }
    }
  }]
}]
```
## Another example

```js
interactions: [{
  type: 'hammer',
  key: 'akey',
  gestures: [{
    type: 'Tap',
    options: {
      event: 'tripleTap',
      taps: 3
    },
    recognizeWith: 'doubleTap tap',
    events: {
      tripleTap: function(e) {
        console.log('triple tapped');
      }
    }
  },{
    type: 'Tap',
    options: {
      event: 'doubleTap',
      taps: 2
    },
    recognizeWith: 'tap',
    requireFailure: 'tripleTap',
    events: {
      doubleTap: function(e) {
        console.log('double tapped');
      }
    }
  },{
    type: 'Tap',
    options: {
      taps: 1
    },
    requireFailure: 'doubleTap tripleTap',
    events: {
      tap: function(e) {
        console.log('tapped');
      }
    }
  },]
}]
```
