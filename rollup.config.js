const path = require('path');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const terser = require('@rollup/plugin-terser');
const jsxPlugin = require('@babel/plugin-transform-react-jsx');

const cwd = process.cwd();
const pkg = require(path.join(cwd, 'package.json')); // eslint-disable-line
const { name, version } = pkg;

const banner = `/*
* ${name} v${version}
* Copyright (c) ${new Date().getFullYear()} QlikTech International AB
* Released under the MIT license.
*/

`;

const topLevelNodeModulesPath = `..${path.sep}..${path.sep}..${path.sep}node_modules`;
const localNodeModulesPath = `..${path.sep}node_modules`;

const watch = process.argv.indexOf('-w') > 2;

const config = (isEsm) => {
  const outputFile = isEsm ? pkg.module : pkg.main;
  const basename = path.basename(outputFile);
  const dir = path.dirname(outputFile);
  const umdName = basename
    .replace(/-([a-z])/g, (m, p1) => p1.toUpperCase())
    .split('.js')
    .join('');

  const cfg = {
    input: path.resolve(cwd, 'src', 'index.ts'),
    output: {
      file: path.resolve(dir, basename),
      format: isEsm ? 'es' : 'umd',
      exports: 'default',
      name: umdName,
      sourcemap: true,
      sourcemapPathTransform: (relativeSourcePath) =>
        relativeSourcePath.replace(topLevelNodeModulesPath, localNodeModulesPath),
      banner,
    },
    plugins: [
      nodeResolve({ extensions: ['.js', '.ts'] }),
      babel({
        extensions: ['.js', '.ts'],
        include: ['src/**'],
        presets: [
          '@babel/preset-typescript',
          [
            '@babel/preset-env',
            {
              modules: false,
              targets: {
                browsers: [
                  'last 2 Chrome versions',
                  'last 2 Firefox versions',
                  'last 2 Edge versions',
                  'Safari >= 11.0',
                  'iOS >= 12.2',
                ],
              },
            },
          ],
        ],
        plugins: [[jsxPlugin, { pragma: 'h' }]],
      }),
      commonjs(),
    ],
  };

  if (process.env.NODE_ENV === 'production' && !isEsm) {
    cfg.plugins.push(
      terser({
        output: {
          preamble: banner,
        },
      })
    );
  }

  return cfg;
};

module.exports = [watch ? false : config(), config(true)].filter(Boolean);
