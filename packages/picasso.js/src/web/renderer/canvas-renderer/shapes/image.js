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
  let width = img.width;
  let height = img.height;
  if (img.symbol === 'circle') {
    const radius = Math.min(img.width, img.height) / 2;
    width = radius * 2;
    height = radius * 2;
  }
  switch (position) {
    case 'top-center':
      img.y -= height / 2;
      break;
    case 'center-left':
      img.x -= width / 2;
      break;
    case 'center-right':
      img.x += width / 2;
      break;
    case 'top-left':
      img.x -= width / 2;
      img.y -= height / 2;
      break;
    case 'top-right':
      img.x += width / 2;
      img.y -= height / 2;
      break;
    case 'bottom-left':
      img.x -= width / 2;
      img.y += height / 2;
      break;
    case 'bottom-right':
      img.x += width / 2;
      img.y += height / 2;
      break;
    case 'bottom-center':
      img.y += height / 2;
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
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.setTransform(currentTransform);
    g.globalAlpha = img.opacity;

    if (!img.width && !img.height) {
      img.width = image.naturalWidth * img.imageScalingFactor;
      img.height = image.naturalHeight * img.imageScalingFactor;
    }

    positionImage(img);

    if (img.symbol === 'circle') {
      const imgCenterX = img.x;
      const imgCenterY = img.y;
      img.r = Math.min(img.width, img.height) / 2;
      const drawX = imgCenterX - img.width / 2;
      const drawY = imgCenterY - img.height / 2;

      g.save();
      g.beginPath();
      g.arc(imgCenterX, imgCenterY, img.r, 0, Math.PI * 2);
      g.clip();
      g.drawImage(image, drawX, drawY, img.width, img.height);
      g.restore();
    } else {
      img.x -= img.width / 2;
      img.y -= img.height / 2;
      g.drawImage(image, img.x, img.y, img.width, img.height);
    }

    g.globalAlpha = 1;

    if (img.updateCollider) {
      img.updateCollider(img);
    }
  });
}
