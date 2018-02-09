# picasso

The `picasso` object is not just a namespace; it's also a function that enables the creation of multiple custom configurations of `picasso.js`. Each call to `picasso()` will return a function with the same interface but with different configurations internally.

```js
import picasso from 'picasso'; // 'global'

picasso.renderer.default('canvas'); // use canvas renderer by default

// configure a custom picasso that logs everything
const pic = picasso({
  logger: { // experimental
    level: 4
  }
});
pic.renderer.default('svg'); // use svg renderer by default for all charts created from this configuration
pic.component('mine', myComponent); // register a custom component


pic.chart(/* */); // svg renderer is used, 'mine' component is available for use

picasso.chart( /* */ ); // canvas renderer is used, 'mine' component not available in this configuration
```
