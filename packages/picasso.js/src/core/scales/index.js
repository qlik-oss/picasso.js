export function updateScaleSize(object, path, size) {
  const o = object[path];
  if (o && o.scale && o.scale.pxScale) {
    o.scale = o.scale.pxScale(size);
  } else if (o && o.pxScale) {
    object[path] = o.pxScale(size);
  }
}

export function scaleWithSize(scale, size) {
  return scale.pxScale ? scale.pxScale(size) : scale;
}
