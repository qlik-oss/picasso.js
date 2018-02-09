const ARG_LENGTH = {
  a: 7,
  c: 6,
  h: 1,
  l: 2,
  m: 2,
  q: 4,
  s: 4,
  t: 2,
  v: 1,
  z: 0
};

const SEGMENT_PATTERN = /([astvzqmhlc])([^astvzqmhlc]*)/ig;

const NUMBER = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/ig;

function parseValues(args) {
  const numbers = args.match(NUMBER);
  return numbers ? numbers.map(Number) : [];
}

/**
 * parse an svg path data string. Generates an Array
 * of commands where each command is an Array of the
 * form `[command, arg1, arg2, ...]`
 *
 * https://www.w3.org/TR/SVG/paths.html#PathDataGeneralInformation
 * @ignore
 *
 * @param {string} path
 * @returns {array}
 */
export default function parse(path) {
  const data = [];
  const p = `${path}`.trim();

  // A path data segment (if there is one) must begin with a "moveto" command
  if (p[0] !== 'M' && p[0] !== 'm') {
    return data;
  }

  p.replace(SEGMENT_PATTERN, (_, command, args) => {
    let type = command.toLowerCase();
    args = parseValues(args);

    // overloaded moveTo
    if (type === 'm' && args.length > 2) {
      data.push([command].concat(args.splice(0, 2)));
      type = 'l';
      command = command === 'm' ? 'l' : 'L';
    }

    // Ignore invalid commands
    if (args.length < ARG_LENGTH[type]) {
      return '';
    }

    data.push([command].concat(args.splice(0, ARG_LENGTH[type])));

    // The command letter can be eliminated on subsequent commands if the same command is used multiple times in a row (e.g., you can drop the second "L" in "M 100 200 L 200 100 L -100 -200" and use "M 100 200 L 200 100 -100 -200" instead).
    while (args.length >= ARG_LENGTH[type] && args.length && ARG_LENGTH[type]) {
      data.push([command].concat(args.splice(0, ARG_LENGTH[type])));
    }

    return '';
  });
  return data;
}
