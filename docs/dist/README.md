---
id: installation
title: Installation
---

## Getting started

> Note: This guide assumes that you have some basic web development knowledge of HTML, JS, CSS and git.

Make sure you have [node.js & npm](https://nodejs.org) installed.

Install `picasso.js` in your project with `npm install picasso.js`.

Create a new HTML file with some basic setup and include the `picasso` bundle:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My picasso.js page</title>
    <script src="node_modules/picasso.js/dist/picasso.min.js"></script>
  </head>
  <body>
    <div id="container">
    </div>
  </body>
  <script>
  </script>
</html>
```

In the script tag, initiate a picasso chart instance:

```html
<script>
picasso.chart({
  element: document.querySelector('#container'), // This is the element to render the chart in
  data: [], // Here you put in the data with additional data type and key, but that is for later
  settings: { // In the settings, we specify how to render the chart
    components: [ // settings.components is an array of components to be rendered in the chart
      {
        type: 'point',
        data: [1, 2, 3, 4, 5, 6],
        settings: {
          x() { return this.data.value / 7; }
        }
      }
    ]
  }
});
</script>
```
