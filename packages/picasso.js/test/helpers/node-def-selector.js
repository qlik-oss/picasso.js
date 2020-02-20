/* eslint-disable no-useless-escape */

const SELECTOR_MAPS = {
  type: /^\w[\w-]+/,
  attr: /^\[\w(?:[\w\._-]+)?(?:[!]?=['\"][\w\s*#_-]*['\"])?\]/,
  universal: /^(\*)/,
  tag: /^\.(\w+)/,
};

const FILTERS = {
  type: (c, objects) => {
    // eslint-disable-line arrow-body-style
    return objects.filter(o => {
      const type = o.node.type;

      if (type) {
        return type.toLowerCase() === c.toLowerCase();
      }
      return false;
    });
  },

  attr: (attr, operator, value, objects) => {
    // eslint-disable-line arrow-body-style
    return objects.filter(o => {
      const v = o.node[attr];

      if (!operator) {
        return typeof v !== 'undefined';
      }
      if (typeof v === 'undefined') {
        return false;
      }

      switch (operator) {
        case '=':
          return value === String(v);
        case '!=':
          return value !== String(v);
        default:
          return false;
      }
    });
  },

  universal: objects => objects,

  tag: (c, objects) => {
    // eslint-disable-line arrow-body-style
    return objects.filter(o => {
      const tag = o.node.tag;
      if (tag) {
        return tag.indexOf(c.replace('.', '')) !== -1;
      }
      return false;
    });
  },
};

/**
 * Filters out objects of given type and value
 * @ignore
 * @example
 * filter(
 *   {type:'type', value:'Circle'},
 *   [new Circle(), new Rectangle()]
 * )
 * // [Circle]
 * @param {Object} token
 * @param {Array} objects
 * @returns {Object[]} Objects that fulfill the type and value
 */
export function filter(token, objects) {
  if (!objects || !objects.length || !token || typeof FILTERS[token.type] !== 'function') {
    return [];
  }

  switch (token.type) {
    case 'type':
      return FILTERS[token.type](token.value, objects);
    case 'attr':
      return FILTERS[token.type](token.attribute, token.operator, token.attributeValue, objects);
    case 'universal':
      return FILTERS[token.type](objects);
    case 'tag':
      return FILTERS[token.type](token.value, objects);
    default:
      return [];
  }
}

/**
 * Tokenizes a string into supported selectors
 * @ignore
 *
 * @example
 * tokenize("Circle[color='red']")
 *
 * @param {String} s
 */
export function tokenize(s) {
  const groups = [];
  let sub;
  let info;
  let match;
  let validSelector;

  s.split(/\s*,\s*/).forEach(group => {
    group = group.trim();
    sub = [];
    const selectorMapsIterator = key => {
      match = group.match(SELECTOR_MAPS[key]);
      if (match) {
        validSelector = true;
        group = group.slice(match[0].length);
        info = {
          type: key,
          value: match[0],
        };

        if (key === 'attr') {
          // extract parts of attribute from e.g. [color='red'] => (color, =, red)
          match = match[0].match(/\[(\w[\w\._-]+)?(?:([!]?=)['\"]([\w\s#_-]*)['\"])?\]/);
          info.attribute = match[1];
          info.operator = match[2];
          info.attributeValue = match[3];
        }
        sub.push(info);
      }
    };
    while (group) {
      validSelector = false;

      match = group.match(/^\s*([>+~]|\s)\s*/);
      if (match) {
        validSelector = true;
        sub.push({
          type: ' ',
          value: match[0],
        });
        group = group.slice(match[0].length);
      }

      Object.keys(SELECTOR_MAPS).forEach(selectorMapsIterator);

      if (sub && sub.length && groups.indexOf(sub) < 0) {
        groups.push(sub);
      }

      if (!validSelector) {
        break;
      }
    }
  });
  return groups;
}

function getDescendants(obj) {
  let r = [];
  let c;

  if (!obj.children) {
    return [];
  }

  for (let i = 0, len = obj.children.length; i < len; i++) {
    c = obj.children[i];
    r.push({ node: c, parent: obj });

    if (c.children && c.children.length) {
      r = r.concat(getDescendants(c));
    }
  }
  return r;
}

export default function find(s, object) {
  const result = [];
  const groupResults = [];
  let groups;
  let descendants = getDescendants(object);

  if (descendants.length) {
    groups = tokenize(s);

    let tokens;

    for (let gi = 0, glen = groups.length; gi < glen; gi++) {
      tokens = groups[gi];

      const levels = [];
      let filtered = descendants.slice();
      let hasRemainder = false;
      tokens.reverse().forEach(token => {
        if (token.type === ' ') {
          levels.push(filtered);
          filtered = descendants.slice();
          hasRemainder = false;
          return;
        }

        filtered = filter(token, filtered);
        hasRemainder = true;
      });

      if (hasRemainder) {
        levels.push(filtered);
      }

      const selected = levels[0].filter(node => {
        let ancestor = node.parent;
        let idx;

        for (let i = 1; i < levels.length; i++) {
          const levelsNode = levels[i].map(lvl => lvl.node);
          idx = levelsNode.indexOf(ancestor);
          while (ancestor && idx < 0) {
            ancestor = ancestor.parent;
            idx = levelsNode.indexOf(ancestor);
          }
          if (idx < 0) {
            return false;
          }
        }
        return true;
      });

      groupResults.push(selected.map(sel => sel.node));
    }

    for (let i = 0, len = groupResults.length; i < len; i++) {
      for (let ni = 0, nlen = groupResults[i].length; ni < nlen; ni++) {
        if (result.indexOf(groupResults[i][ni]) < 0) {
          result.push(groupResults[i][ni]);
        }
      }
    }
  }

  return result || [];
}
