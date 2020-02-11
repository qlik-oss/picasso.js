function getPattern(pattern, dummyCanvas, ctx) {
  dummyCanvas.width = pattern.width;
  dummyCanvas.height = pattern.height;
  ctx.save();
  ctx.fillStyle = pattern.fill;

  pattern.shapes.forEach(s => {
    switch (s.type) {
      case 'rect':
        ctx.rect(s.x, s.y, s.width, s.height);
        break;
      default:
        break;
    }
  });
  ctx.fill();
  ctx.restore();
  return ctx.createPattern(dummyCanvas, 'repeat');
}

export default function patternizer(document) {
  const dummyCanvas = document.createElement('canvas');
  const ctx = dummyCanvas.getContext('2d');

  let cache = {};

  return {
    create(pattern) {
      const key = pattern.key;
      if (key) {
        cache[key] = cache[key] || getPattern(pattern, dummyCanvas, ctx);
        return cache[key];
      }
      return getPattern(pattern, dummyCanvas, ctx);
    },
    clear() {
      cache = {};
    },
  };
}
