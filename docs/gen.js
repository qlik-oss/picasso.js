const rimraf = require('rimraf');
const fs = require('fs');
const path = require('path');
const spec = require('./spec.json');

const glob = require('glob');
const handlebars = require('handlebars');
require('handlebars-helpers')({ handlebars });

function log(msg) {
  console.log(msg);
}

log('Generating docs...');

const MD_TEMPLATES_FOLDER = 'src/templates/';
const MD_INPUT_FOLDER = 'src/input/';
const MD_OUTPUT_FOLDER = 'dist/';
const POSTPROCESS_ROOT = 'src/';

function domkdir(curpath, skipFile) {
  let tryPath = curpath;
  if (skipFile) {
    tryPath = path.dirname(tryPath);
  }
  // find missing directories
  let dirs = [];
  while (tryPath && !fs.existsSync(tryPath)) {
    dirs.push(tryPath);
    tryPath = path.dirname(tryPath);
  }
  // create them
  for (let i = dirs.length - 1; i >= 0; --i) {
    fs.mkdirSync(dirs[i]);
  }
}

/**
 * TEMPLATES
 */
function registerTemplates(cb) {
  glob(`${MD_TEMPLATES_FOLDER}**/*.md`, {}, (err, files) => {
    files.forEach((file) => {
      const title = path.basename(file, '.md');
      const content = `${fs.readFileSync(file)}`;
      handlebars.registerPartial(title, content);
    });
    cb();
  });

  handlebars.registerPartial(undefined, '{{undefinedpartial}}');
}

handlebars.registerHelper('undefinedpartial', () => 'This partial does not exists. This may most certainly be caused by a missing file.');

/**
 * POSTPROCESS
 */
function postProcessTemplate(item) {
  return `#%#%#%#%# DOCS-GEN-POSTPROCESS: ${item} #%#%#%#%#`;
}

handlebars.registerHelper('postprocess', function (item) { // eslint-disable-line
  this._post.push(item);

  return postProcessTemplate(item);
});

function doPostProcess(content, jsdocdata) {
  jsdocdata._post.forEach((item) => {
    const itemTemplate = handlebars.compile(fs.readFileSync(path.resolve(`${POSTPROCESS_ROOT}${item}.md`)).toString());
    content = content.replace(postProcessTemplate(item), itemTemplate(jsdocdata));
  });
  return content;
}

/**
 * COMPILATION OF INPUT FOLDER FILES
 */
function compileMarkdownFiles(jsdocdata) {
  glob(`${MD_INPUT_FOLDER}/**/*.md`, {}, (err, files) => {
    files.forEach((file) => {
      const relativePath = path.relative(MD_INPUT_FOLDER, file);
      const template = handlebars.compile(`${fs.readFileSync(file)}`);
      let title = path.basename(file, '.md');

      title = title.charAt(0).toUpperCase() + title.substr(1);

      domkdir(path.join(MD_OUTPUT_FOLDER, relativePath), true);

      jsdocdata._registry = [];
      jsdocdata._post = [];
      jsdocdata._title = title;

      // log(`Processing file ${relativePath}`);

      let output = template(jsdocdata);

      output = doPostProcess(output, jsdocdata);

      fs.writeFileSync(MD_OUTPUT_FOLDER + relativePath, output);
    });
  });
}

handlebars.registerHelper('ifCond', function ifCond(v1, operator, v2, options) {
  // https://stackoverflow.com/revisions/16315366/1
  switch (operator) {
    case '==':
      return (v1 == v2) ? options.fn(this) : options.inverse(this); // eslint-disable-line eqeqeq
    case '===':
      return (v1 === v2) ? options.fn(this) : options.inverse(this);
    case '!=':
      return (v1 != v2) ? options.fn(this) : options.inverse(this);// eslint-disable-line eqeqeq
    case '!==':
      return (v1 !== v2) ? options.fn(this) : options.inverse(this);
    case '<':
      return (v1 < v2) ? options.fn(this) : options.inverse(this);
    case '<=':
      return (v1 <= v2) ? options.fn(this) : options.inverse(this);
    case '>':
      return (v1 > v2) ? options.fn(this) : options.inverse(this);
    case '>=':
      return (v1 >= v2) ? options.fn(this) : options.inverse(this);
    case '&&':
      return (v1 && v2) ? options.fn(this) : options.inverse(this);
    case '||':
      return (v1 || v2) ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});

handlebars.registerHelper('ifDefined', function ifDefined(value, options) {
  return typeof value !== 'undefined' ? options.fn(this) : options.inverse(this);
});

handlebars.registerHelper('anchor', (...args) => {
  const names = args.slice(0, args.length - 1);
  let name = names.join('.');
  name = encodeURIComponent(name);
  spec._registry = spec._registry || [];
  spec._registry.push(name);
  return new handlebars.SafeString(`<a name='${name}' href='#${name}'># </a>`);
});

handlebars.registerHelper('no', v => v || 'No');
handlebars.registerHelper('nocust', (v, fb) => v || (fb || 'No'));

handlebars.registerHelper('med', (node, options) => {
  const context = node;
  if (context && options.hash) {
    return options.fn(Object.assign(context, options.hash));
  }
  return options.fn(context);
});

handlebars.registerHelper('typedef', (node, options) => {
  if (!node) {
    return '';
  }
  let t = '';
  if (node.kind === 'union' && node.items) {
    t = node.items.map(tt => tt.type).join(' | ');
    t = options.fn(t).replace(' | ', ' &#124; ');
    // console.log(t, new handlebars.SafeString(t));
  } else if (node.kind === 'array' && node.items) {
    let subtype = node.items.kind || node.items.type;
    // t = `Array&lt;${subtype}&gt;`;
    t = `Array<${subtype}>`;
    t = options.fn(t);
  } else {
    t = node.kind ? node.kind : node.type;
    t = options.fn(t);
  }
  return new handlebars.SafeString(t);
});

handlebars.registerHelper('sample', (node) => {
  if (!node) {
    return '';
  }
  const defaultType = typeof node.defaultValue;
  let s = '';
  if (defaultType === 'undefined') {
    if (node.kind === 'union' && node.items) {
      s = `/* ${node.items.map(tt => tt.type).join(' | ')} */`;
    } else {
      s = `/* ${node.kind || node.type} */`;
    }
  } else if (defaultType === 'string' && node.defaultValue[0] !== "'") { // add quotes
    s = `'${node.defaultValue}'`;
  } else {
    s = node.defaultValue;
  }
  return new handlebars.SafeString(s);
});

handlebars.registerHelper('helperMissing', (context) => {
  // log(`Template defines {{ ${context.name} }}, but not provided in context`);
  return '';
});

rimraf.sync(`${MD_OUTPUT_FOLDER}*`);

registerTemplates(() => { compileMarkdownFiles(spec); });
