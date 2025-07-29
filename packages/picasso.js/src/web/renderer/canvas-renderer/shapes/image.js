let offscreenBuffer = null;
function loadImage(src, onLoad) {
  const image = new Image();
  image.src = src;

  image.onload = () => {
    onLoad(image);
  };

  image.onerror = (e) => {
    console.error('Image load error', e);
  };
}
function positionImage(img) {
  const position = img.imgPosition || 'center-center';
  if (img.symbol === 'circle') {
    const radius = Math.min(img.width, img.height) / 2;
    img.width = radius * 2;
    img.height = radius * 2;
  }
  if (position) {
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
    if (img.imgScalingFactor) {
      img.width = image.naturalWidth * img.imgScalingFactor;
      img.height = image.naturalHeight * img.imgScalingFactor;
    }
    positionImage(img);
    // Draw shape
    if (img.symbol === 'circle') {
      const radius = Math.min(img.width, img.height) / 2;
      const cx = img.x;
      const cy = img.y;
      const drawX = cx - radius;
      const drawY = cy - radius;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(image, drawX, drawY, radius * 2, radius * 2);
      ctx.restore();
    } else {
      ctx.drawImage(image, img.x - img.width / 2, img.y - img.height / 2, img.width, img.height);
    }

    // Copy to visible canvas
    if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
      canvas.width = renderWidth;
      canvas.height = renderHeight;
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.drawImage(offscreenBuffer, 0, 0, renderWidth, renderHeight, 0, 0, canvas.width, canvas.height);
  });
}
