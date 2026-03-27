export function isNumber(v) {
  return typeof v === 'number' && !isNaN(v);
}

export function notNumber(value) {
  return typeof value !== 'number' || isNaN(value);
}
