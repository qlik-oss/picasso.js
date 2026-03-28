/* eslint-disable no-useless-escape */

interface SelectorMaps {
  [key: string]: RegExp;
}

interface FilterFunction {
  (attr: string, operator: string, value: string, objects: any[]): any[];
  (objects: any[]): any[];
  (selector: string, objects: any[]): any[];
  (c: string, objects: any[]): any[];
}

interface TokenInfo {
  type: string;
  value: string;
  attribute?: string;
  operator?: string;
  attributeValue?: string;
}

const SELECTOR_MAPS: SelectorMaps = {
  type: /^\w[\w-]+/,
  attr: /^\[\w(?:[\w\._-]+)?(?:[!]?=['\"][\w\s*#_-]*['\"])?\]/,
  universal: /^(\*)/,
  tag: /^\.(\w+)/,
};

const FILTERS: Record<string, (...args: any[]) => any[]> = {
  type: (c: string, objects: any[]): any[] =>
    objects.filter((o: any) => {
      const type = o.type;

      if (type) {
        return type.toLowerCase() === c.toLowerCase();
      }
      return false;
    }),
  attr: (attr: string, operator: string, value: string, objects: any[]): any[] =>
    objects.filter((o: any) => {
      const v = o.attrs[attr];

      if (!operator) {
        // TODO handle undefined differently for != operator? As display object may very well have a default rendering color
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
    }),
  universal: (objects: any[]): any[] => objects,

  tag: (selector: string, objects: any[]): any[] =>
    objects.filter((o: any) => {
      const tag = o.tag;
      if (tag) {
        return tag.trim().split(/\s+/).indexOf(selector.replace('.', '')) !== -1;
      }
      return false;
    }),
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
export function filter(token: TokenInfo, objects: any[]): any[] {
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
export function tokenize(s: string): TokenInfo[][] {
  const groups: TokenInfo[][] = [];
  let sub: TokenInfo[];
  let info: TokenInfo;
  let match: RegExpMatchArray | null;
  let validSelector: boolean;

  s.split(/\s*,\s*/).forEach((group: string) => {
    group = group.trim();
    sub = [];
    const selectorMapsIterator = (key: string) => {
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
          const attrMatch = match[0].match(/\[(\w[\w\._-]+)?(?:([!]?=)['\"]([\w\s#_-]*)['\"])?\]/);
          if (attrMatch) {
            info.attribute = attrMatch[1];
            info.operator = attrMatch[2];
            info.attributeValue = attrMatch[3];
          }
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

function find(s: string, object: any): any[] {
  const result: any[] = [];
  const groupResults: any[][] = [];
  let groups: TokenInfo[][];
  let descendants: any[];

  if (object.isBranch) {
    groups = tokenize(s);
    descendants = object.descendants;

    let tokens: TokenInfo[];

    for (let gi = 0, glen = groups.length; gi < glen; gi++) {
      tokens = groups[gi];

      const levels: any[][] = [];
      let filtered = descendants.slice();
      let hasRemainder = false;
      tokens.reverse().forEach((token: TokenInfo) => {
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

      const selected = levels[0].filter((node: any) => {
        let ancestor = node.parent;
        let idx: number;

        for (let i = 1; i < levels.length; i++) {
          idx = levels[i].indexOf(ancestor);
          while (ancestor && idx < 0) {
            ancestor = ancestor.parent;
            idx = levels[i].indexOf(ancestor);
          }
          if (idx < 0) {
            return false;
          }
        }
        return true;
      });

      groupResults.push(selected);
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

export default {
  find,
};
