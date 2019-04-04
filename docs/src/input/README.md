---
id: installation
title: Installation
---

## Getting started

> Note: This guide assumes that you have some basic web development knowledge of HTML, JS, CSS and git.

Create a new HTML file with some basic setup and include the `picasso.js` bundle:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My picasso.js page</title>
    <script src="https://unpkg.com/picasso.js"></script>
    <style>
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
    }
    #container {
      height: 100%;
      position: relative;
    }
    </style>
  </head>
  <body>
    <div id="container">
    </div>
    <script>
    /* PLACE CODE HERE */
    </script>
  </body>
</html>
```

In the script tag, initiate a picasso chart instance:

```html
<script>
picasso.chart({
  element: document.querySelector('#container'), // This is the element to render the chart in
  data: [{
    type: 'matrix',
    data: [
      ['Month', 'Sales', 'Margin'],
      ['Jan', 1106, 7],
      ['Feb', 5444, 53],
      ['Mar', 147, 64],
      ['Apr', 7499, 47],
      ['May', 430, 62],
      ['June', 9735, 13],
      ['July', 5832, 13],
      ['Aug', 7435, 15],
      ['Sep', 3467, 35],
      ['Oct', 3554, 78],
      ['Nov', 5633, 23],
      ['Dec', 6354, 63],
    ]
  }],
  settings: { 
    scales: {
      x: { data: { field: 'Margin' } },
      y: { data: { field: 'Sales' } }
    },
    components: [{ // specify how to render the chart
        type: 'axis',
        scale: 'y',
        layout: {
          dock: 'left'
        }
      }, {
        type: 'axis',
        scale: 'x',
        layout: {
          dock: 'bottom'
        }
      }, {
        type: 'point',
        data: {
          extract: {
            field: 'Month',
            props: {
              x: { field: 'Margin' },
              y: { field: 'Sales' }
            }
          }
        },
        settings: {
          x: { scale: 'x' },
          y: { scale: 'y' },
          size: function () { return Math.random(); }
        }
      }
    ]
  }
});
</script>
```

You should now see a very basic bubble plot.
