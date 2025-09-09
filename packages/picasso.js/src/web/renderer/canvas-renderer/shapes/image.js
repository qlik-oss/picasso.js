let offscreenBuffer = null;

function loadImage(src, onLoad) {
  if (loadImage.cache[src]) {
    onLoad(loadImage.cache[src]);
    return;
  }
  const image = new Image();
  image.src = src;
  image.onload = () => {
    loadImage.cache[src] = image;
    onLoad(image);
  };

  image.onerror = (e) => {
    console.error('Image load error', e);
  };
}

loadImage.cache = {};

export function positionImage(img) {
  const position = img.imagePosition || 'center-center';
  if (img.symbol === 'circle') {
    const radius = Math.min(img.width, img.height) / 2;
    img.width = radius * 2;
    img.height = radius * 2;
  }
  switch (position) {
    case 'top-center':
      img.y -= img.height / 2;
      break;
    case 'center-left':
      img.x -= img.width / 2;
      break;
    case 'center-right':
      img.x += img.width / 2;
      break;
    case 'top-left':
      img.x -= img.width / 2;
      img.y -= img.height / 2;
      break;
    case 'top-right':
      img.x += img.width / 2;
      img.y -= img.height / 2;
      break;
    case 'bottom-left':
      img.x -= img.width / 2;
      img.y += img.height / 2;
      break;
    case 'bottom-right':
      img.x += img.width / 2;
      img.y += img.height / 2;
      break;
    case 'bottom-center':
      img.y += img.height / 2;
      break;
    default:
      break;
  }
}
export default function render(img, { g }) {
  const canvas = g.canvas;

  const ratio = window.devicePixelRatio || 1;
  const logicalWidth = canvas.clientWidth;
  const logicalHeight = canvas.clientHeight;

  const renderWidth = logicalWidth * ratio;
  const renderHeight = logicalHeight * ratio;

  if (!offscreenBuffer || offscreenBuffer.width !== renderWidth || offscreenBuffer.height !== renderHeight) {
    offscreenBuffer = document.createElement('canvas');
    offscreenBuffer.width = renderWidth;
    offscreenBuffer.height = renderHeight;
  }
  loadImage(img.src, (image) => {
    const ctx = offscreenBuffer.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, offscreenBuffer.width, offscreenBuffer.height);
    ctx.globalAlpha = img.opacity;
    if (!img.width && !img.height) {
      img.width = image.naturalWidth * img.imageScalingFactor;
      img.height = image.naturalHeight * img.imageScalingFactor;
    }
    positionImage(img);

    if (img.symbol === 'circle') {
      img.r = Math.min(img.width, img.height) / 2;
      img.cx = img.x;
      img.cy = img.y;
      const drawX = img.cx - img.r;
      const drawY = img.cy - img.r;
      ctx.save();
      ctx.beginPath();
      ctx.arc(img.cx, img.cy, img.r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(image, drawX, drawY, img.r * 2, img.r * 2);
      ctx.restore();
    } else {
      img.x -= img.width / 2;
      img.y -= img.height / 2;
      ctx.drawImage(image, img.x, img.y, img.width, img.height);
    }

    // Copy to visible canvas
    if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
      canvas.width = renderWidth;
      canvas.height = renderHeight;
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.drawImage(offscreenBuffer, 0, 0, renderWidth, renderHeight, 0, 0, canvas.width, canvas.height);
    if (img.updateCollider) {
      // Update collider after image has been loaded and positioned
      img.updateCollider(img);
    }
  });
}
