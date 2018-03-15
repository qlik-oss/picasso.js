/* eslint-env-node */

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';
import license from 'rollup-plugin-license';

import path from 'path';

const pkg = require(path.join(process.cwd(), 'package.json')); // eslint-disable-line

const hasName = process.argv.indexOf('--name') + 1 || process.argv.indexOf('-n') + 1;
const name = hasName ? process.argv[hasName] : 'picasso';
const fileName = name.replace(/([A-Z])/g, (m, s) => `-${s.toLowerCase()}`);

const config = {
  entry: 'src/index.js',
  dest: `dist/${fileName}.min.js`,
  moduleName: name,
  format: 'umd',
  sourceMap: true,
  plugins: [
    resolve({ jsnext: true, preferBuiltins: false }),
    babel({
      exclude: 'node_modules/**',
      presets: [['es2015', { modules: false }]],
      plugins: ['external-helpers']
    }),
    commonjs(),
    filesize(),
    uglify()
  ]
};

config.plugins.push(license({
  banner: `
    ${pkg.name} v${pkg.version}
    Copyright (c) ${new Date().getFullYear()} QlikTech International AB
  `
}));

export default config;
