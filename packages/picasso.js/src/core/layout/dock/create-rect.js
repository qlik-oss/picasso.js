export default function createRect(x, y, width, height, margin) {
  return {
    x: isNaN(x) ? 0 : x,
    y: isNaN(x) ? 0 : y,
    width: isNaN(x) ? 0 : width,
    height: isNaN(x) ? 0 : height,
    margin: isNaN(margin) ? 0 : margin,
  };
}
