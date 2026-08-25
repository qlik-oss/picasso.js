let version = require('../package.json').version;
let fs = require('fs');

const name = 'src/about.js';
const output = `export default { version: '${version}' };\n`;

fs.writeFileSync(name, output);
