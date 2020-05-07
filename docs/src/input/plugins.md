---
id: plugins
title: Plugins
---

The `picasso` namespace exposes various _registries_ to allow functionality to be extended.

A custom component for example can be registered on the `component` registry, and a scale to the `scale` registry:

```js
picasso.component('my-comp', {
  /* */
});
picasso.scale('my-scale', {
  /* */
});
```

To make this more modular and shareable picasso exposes a `use` method for convenience:

```js
picasso.use(myPlugin);
```

where `myPlugin` is a function in which the variuos registries are used:

```js
// my-plugin.js

export default function (picasso) {
  picasso.component('my-component-1', {
    /* ... */
  });
  picasso.component('my-component-2', {
    /* ... */
  });
}
```

```js
// main.js

import picasso from 'picasso.js';
import myPlugin from './my-plugin';

// Initialize picasso plugins
picasso.use(myPlugin);

// Do regular picasso stuff
picasso.chart({
  /* ... */
});
```
