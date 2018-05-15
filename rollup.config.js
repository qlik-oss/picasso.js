/* eslint-env-node */

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';
import license from 'rollup-plugin-license';
import rimraf from 'rimraf';
import path from 'path';

const cwd = process.cwd();
const { name, version, main } = require(path.join(cwd, 'package.json')); // eslint-disable-line
const production = process.env.NODE_ENV === 'production';
const basename = path.basename(main);
const dir = path.dirname(main);
const umdName = basename.replace(/-([a-z])/g, (m, p1) => p1.toUpperCase()).split('.js').join('');

rimraf.sync(dir);

const config = {
  input: 'src/index.js',
  cache: true,
  output: {
    file: `${main}`,
    name: umdName,
    format: 'umd',
    sourcemap: true
  },
  plugins: [
    resolve({ jsnext: true, preferBuiltins: false }),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
      presets: [['es2015', { modules: false }]],
      plugins: ['external-helpers']
    }),
    ...(production ? [uglify()] : []),
    filesize(),
    license({
      banner: `
        ${name} v${version}
        Copyright (c) ${new Date().getFullYear()} QlikTech International AB
      `
    })
  ]
};

export default config;
