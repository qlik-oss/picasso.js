# Examples of picasso.js

All examples depend on bundled versions of picasso.js and its plugins and are downloaded from [https://unpkg.com](https://unpkg.com).

If you prefer to load from the local build environment instead, you should install, bootstrap and build the packages by running the following in the root of this repo:

```sh
npm i && npm run bootstrap && npm run build
```

Then replace the script `src` to the built bundles, e.g.

Replace:

```html
<script src="https://unpkg.com/picasso.js"></script>
```

with:

```html
<script src="../../packages/picasso.js/dist/picasso.min.js"></script>
```
