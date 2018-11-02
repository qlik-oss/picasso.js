const yargs = require('yargs');
const path = require('path');
const globby = require('globby');
const { packages } = require('./lerna.json');

const argv = yargs
  .options({
    scope: {
      description: 'Scope to package',
      type: 'string',
      default: '',
      alias: 's'
    },
    type: {
      description: 'Type of tests to run',
      type: 'string',
      alias: 't',
      default: 'unit',
      choices: ['unit', 'component']
    }
  })
  .coerce('scope', (scope) => {
    const scopes = new Map();
    globby.sync(packages.map(p => `${p}/package.json`)).forEach((p) => {
      const name = require(`./${p}`).name; //eslint-disable-line
      const pkgPath = path.dirname(p);
      scopes.set(name, pkgPath);
    });
    const s = scopes.get(scope);
    if (s) {
      return s;
    }
    if (scope && !s) {
      throw new Error(`Scope ${scope} not found`);
    }
    return `*(${packages.join('|').split('/*').join('')})/*`;
  })
  .argv;

const TYPES = {
  unit: {
    glob: `${argv.scope}/src/**/*.spec.js`,
    reportDir: 'coverage/unit'
  },
  component: {
    glob: `${argv.scope}/test/component/**/*.comp.js`,
    reportDir: 'coverage/component'
  }
};

const type = TYPES[argv.type];

const glob = [type.glob];
const src = [`${argv.scope}/src/**/!(*.spec).js`];

module.exports = {
  glob,
  src,
  watchGlob: [...src, ...glob],
  nyc: {
    include: src,
    sourceMap: false,
    instrumenter: './lib/instrumenters/noop',
    reportDir: type.reportDir
  },
  coverage: true
};
