const React = require('react');
const CompLibrary = require('../../core/CompLibrary.js');
const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */

const examples = [{
  title: 'Scatter plot',
  img: 'https://static.observableusercontent.com/thumbnail/9fd6dd828f1d41ed2a0f160b5cf41ff55d0e251f7fab5486b510e23ac0afad78.jpg',
  links: {
    observable: 'https://beta.observablehq.com/@miralemd/picasso-js-example'
  },
  tags: {
    chart: ['scatter'],
    component: ['point', 'axis', 'legend-cat']
  }
}, {
  title: 'Point distribution',
  img: 'https://static.observableusercontent.com/thumbnail/624def26ff3449eb307b944be1ccd7ed360ffd3803cab3d3843ffb1eb972c7dc.jpg',
  links: {
    observable: 'https://beta.observablehq.com/@miralemd/picasso-js-point-distribution'
  },
  tags: {
    chart: ['scatter'],
    component: ['point', 'axis', 'grid-line']
  }
}, {
  title: 'Point matrix',
  img: 'https://static.observableusercontent.com/thumbnail/61fc049bceb805a2d27d85f1db8b76d10e24de82e62b386abba182381c965c5e.jpg',
  links: {
    observable: 'https://beta.observablehq.com/@miralemd/picasso-js-point-matrix'
  },
  tags: {
    chart: ['scatter'],
    component: ['point', 'axis']
  }
}, {
  title: 'Bar chart',
  img: 'https://static.observableusercontent.com/thumbnail/b1867eaba8ef33981b7476d2d556aa9f169eb9a2b25a9c3d3ccf69bd54627866.jpg',
  links: {
    observable: 'https://beta.observablehq.com/@miralemd/picasso-js-bar-chart'
  },
  tags: {
    chart: ['bar'],
    component: ['box', 'axis']
  }
}, {
  title: 'Stacked bar chart',
  img: 'https://static.observableusercontent.com/thumbnail/870b319c1c6cd62ecbcf98f0b7610b9b4cf5be51e9ee3a86805d1d85be967ca7.jpg',
  links: {
    observable: 'https://beta.observablehq.com/@miralemd/picasso-js-stacked-bar-chart'
  },
  tags: {
    chart: ['bar'],
    component: ['box', 'axis', 'legend-cat']
  }
}, {
  title: 'Box plot',
  img: 'https://static.observableusercontent.com/thumbnail/50c50a467861f8cd4e5da50b1715ccad43ef2b5d3aad174aaf339c53d03ec439.jpg',
  links: {
    observable: 'https://beta.observablehq.com/@miralemd/picasso-js-box-plot'
  },
  tags: {
    chart: ['box'],
    component: ['box', 'axis']
  }
}, {
  title: 'Gantt chart',
  img: 'https://static.observableusercontent.com/thumbnail/0d55ea2782981434f7811221aa572eab64ae545d24dc36ac779227d68e33c0a2.jpg',
  links: {
    observable: 'https://beta.observablehq.com/@miralemd/picassojs-gantt-chart'
  },
  tags: {
    chart: ['gantt'],
    component: ['box', 'axis', 'labels']
  }
}, {
  title: 'Bullet graph',
  img: 'https://static.observableusercontent.com/thumbnail/a14be2c7c30e33e19bd0033808b6847d073da89e130286b0b8ba9f44239b429d.jpg',
  links: {
    observable: 'https://beta.observablehq.com/@miralemd/picasso-js-bullet-graph'
  },
  tags: {
    chart: ['bullet'],
    component: ['box', , 'point', 'axis']
  }
}, {
  title: 'Line chart',
  img: 'https://static.observableusercontent.com/thumbnail/6b56ef19ff9959ce9dc6d1682d0efe376a2982c6e852889e5b1428d5a35f00c6.jpg',
  links: {
    observable: 'https://beta.observablehq.com/@miralemd/picasso-js-line-chart'
  },
  tags: {
    chart: ['line'],
    component: ['line', 'axis']
  }
}, {
  title: 'Area chart',
  img: 'https://static.observableusercontent.com/thumbnail/0631aeab3ab2a2f6127036a5dd1e4c82c4b99838509c39a21cc6e8b82a45726f.jpg',
  links: {
    observable: 'https://beta.observablehq.com/@miralemd/picasso-js-area-chart'
  },
  tags: {
    chart: ['area'],
    component: ['line', 'axis']
  }
}, {
  title: 'Stacked area chart',
  img: 'https://static.observableusercontent.com/thumbnail/387605b07da277224230045158384fd2dbb42e3693831b14e80c3d8d4ba0e358.jpg',
  links: {
    observable: 'https://beta.observablehq.com/@miralemd/picasso-js-stacked-area-chart'
  },
  tags: {
    chart: ['area'],
    component: ['line', 'axis']
  }
}, {
  title: 'Multiple lines',
  img: 'https://static.observableusercontent.com/thumbnail/6b16a7f8e3e259e26706db6ec7249bb253e7ac5a01ffe5a3718cc99788969f8a.jpg',
  links: {
    observable: 'https://beta.observablehq.com/@miralemd/picasso-js-multi-axis-line-chart'
  },
  tags: {
    chart: ['line'],
    component: ['line', 'axis', 'legend-cat']
  }
}, {
  title: 'Stream graph',
  img: 'https://static.observableusercontent.com/thumbnail/2027a1ae29ca79e884ee67eb24621da1d4df74113d38828e3bc2dfabb615f30a.jpg',
  links: {
    observable: 'https://beta.observablehq.com/@miralemd/picasso-js-stream-graph'
  },
  tags: {
    chart: ['stream'],
    component: ['line', 'axis']
  }
}, {
  title: 'Area range',
  img: 'https://static.observableusercontent.com/thumbnail/bc2eff6dbc7fbb36d7bffc465f22d441b66ed5d9313ede9cce67bd49624857ab.jpg',
  links: {
    observable: 'https://beta.observablehq.com/@miralemd/picasso-js-range-area-chart'
  },
  tags: {
    chart: ['area'],
    component: ['line', 'axis']
  }
}, {
  title: 'Dumbbell plot',
  img: 'https://static.observableusercontent.com/thumbnail/a52ac6c70b684e930d88ccd9cd70a1b615cecf56c70ca29d40a1ab220b0de281.jpg',
  links: {
    observable: 'https://beta.observablehq.com/@miralemd/picasso-js-dumbbell-plot'
  },
  tags: {
    chart: ['dumbbell'],
    component: ['point', 'axis', 'box']
  }
}, {
  title: 'Pie chart',
  img: 'https://static.observableusercontent.com/thumbnail/8e794094be02b6710b688e90aa2dc53310caa0ca5eaa5ed1779932cf1cf60187.jpg',
  links: {
    observable: 'https://beta.observablehq.com/@miralemd/picasso-js-pie-chart'
  },
  tags: {
    chart: ['pie'],
    component: ['pie']
  }
}, {
  title: 'Donut chart',
  img: 'https://static.observableusercontent.com/thumbnail/549bda6fc8959d05eb72b4fe62602fcff44aa36f6570e18f63870266a97935d1.jpg',
  links: {
    observable: 'https://beta.observablehq.com/@miralemd/picasso-js-donut-chart'
  },
  tags: {
    chart: ['pie'],
    component: ['pie']
  }
}];

const Sample = props => (
  <div className="cell">
    <div className="card">
      <a href={props.links.observable} target="_blank">
        <div style={{
          backgroundImage: `url(${props.img})`
        }}></div>
      </a>
      <div className="info">
        <h3>{props.title}</h3>
        <div>
          <span>{props.description}</span>
        </div>
      </div>
    </div>
  </div>
)

const Empty = props => (
  <div className="cell"></div>
)

const items = examples.map(Sample).concat([0, 1, 2].map(Empty));

const Category = props => (
  <div className="category">
    <h2>{props.title}</h2>
    <MarkdownBlock>
    The majority of the following examples are [reactive notebooks](https://beta.observablehq.com/@mbostock/introduction-to-notebooks) - a powerful new way of creating interactive documents.
    </MarkdownBlock>
    <div className="gallery">
      {props.children}
    </div>
  </div>
)

class Examples extends React.Component {
  render() {
    return (
      <div className="docMainWrapper wrapper">
        <div className="container mainContainer">
          <div className="wrapper">
            <div className="post">
              <header class="postHeader"><h1>Examples</h1></header>
              <Category title="Charts" children={items}/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Examples;
