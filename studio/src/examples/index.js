const use = require.context('./', true, /^(?!.*index.js)((.*\.(js\.*))[^.]*$)/i);
const files = use.keys();
const registry = [];

for (let index = 0; index < files.length; index += 1) {
  const fileName = files[index];
  registry.push(use(fileName).default);
}

export default registry;
