const transformRegEx = /(translate|scale|rotate|matrix)\(([0-9,.eE+-\s]+)(?:,|\s?)+\)/g;

function parseTransform(transform) {
  let m,
    commands = [];
  while ((m = transformRegEx.exec(transform)) !== null) { // eslint-disable-line no-cond-assign
    const argsStr = m[2].trim();
    const args = argsStr.indexOf(',') === -1 ? argsStr.split(' ') : argsStr.split(',');

    commands.push({
      cmd: m[1],
      args: args.filter(a => a.trim().length > 0).map(a => Number(a))
    });
  }

  return commands;
}

function resolveRotateCmd(matrix, transform) {
  const radians = transform.args[0] * (Math.PI / 180);

  if (transform.args.length > 2) {
    const x = transform.args[1];
    const y = transform.args[2];
    matrix.translate(x, y);
    matrix.rotate(radians);
    matrix.translate(-x, -y);
  } else if (transform.args.length === 1) {
    matrix.rotate(radians);
  }
}

function resolveScaleCmd(matrix, transform) {
  const x = transform.args[0];
  const y = isNaN(transform.args[1]) ? transform.args[0] : transform.args[1];
  matrix.scale(x, y);
}

function resolveTranslateCmd(matrix, transform) {
  const x = transform.args[0];
  const y = isNaN(transform.args[1]) ? 0 : transform.args[1];
  matrix.translate(x, y);
}

function resolveMatrixCmd(matrix, transform) {
  if (transform.args.length >= 6) {
    matrix.transform(...transform.args);
  }
}

export default function resolveTransform(t, matrix) {
  const transforms = parseTransform(t);
  let transform;

  for (let i = 0, len = transforms.length; i < len; i++) {
    transform = transforms[i];

    if (transform.cmd === 'rotate') {
      resolveRotateCmd(matrix, transform);
    } else if (transform.cmd === 'scale') {
      resolveScaleCmd(matrix, transform);
    } else if (transform.cmd === 'matrix') {
      resolveMatrixCmd(matrix, transform);
    } else if (transform.cmd === 'translate') {
      resolveTranslateCmd(matrix, transform);
    }
  }
}
