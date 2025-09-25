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
  const currentTransform = g.getTransform();
  const ratio = window.devicePixelRatio || 1;
  const logicalWidth = canvas.clientWidth;
  const logicalHeight = canvas.clientHeight;
  const renderWidth = logicalWidth * ratio;
  const renderHeight = logicalHeight * ratio;

  // Ensure canvas is correctly sized for high-DPI
  if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
    canvas.width = renderWidth;
    canvas.height = renderHeight;
  }

  // Load and draw image
  loadImage(img.src, (image) => {
    // Clear main canvas
    g.setTransform(1, 0, 0, 1, 0, 0); // Reset transform before clearing
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.setTransform(currentTransform); // Restore previous transform

    g.globalAlpha = img.opacity;

    // Set default dimensions if not set
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

      g.save();
      g.beginPath();
      g.arc(img.cx, img.cy, img.r, 0, Math.PI * 2);
      g.clip();
      g.drawImage(image, drawX, drawY, img.r * 2, img.r * 2);
      g.restore();
    } else {
      img.x -= img.width / 2;
      img.y -= img.height / 2;
      g.drawImage(image, img.x, img.y, img.width, img.height);
    }

    g.globalAlpha = 1; // Reset alpha after draw

    if (img.updateCollider) {
      img.updateCollider(img);
    }
  });
}
