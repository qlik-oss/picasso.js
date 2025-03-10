const dataUrl =
  'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiCiAgICAgd2lkdGg9IjI1IiBoZWlnaHQ9IjI1IgogICAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InJlZCIgLz4KCiAgPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9ImdyZWVuIiAvPgoKPC9zdmc+Cg==';

export default function render(img, { g, doStroke }) {
  const image = new Image(img.width, img.height);
  image.src = img.src;

  image.onerror = (e) => {
    console.log('%c IMAGE ERROR', 'color: red', {
      error: e,
      src: image.src,
    });
  };

  // image.onload = () => {
  //   console.log('%c loaded image', 'color: lime', image.src);
  //   try {
  //     g.drawImage(image, img.x, img.y, img.width, img.height);
  //   } catch (error) {
  //     console.log('%c draw image error', 'color: orangered', error);
  //   }
  // };

  if (doStroke) {
    g.rect(img.x, img.y, img.width, img.height);
    g.stroke();
  }

  try {
    g.drawImage(image, img.x, img.y, img.width, img.height);
  } catch (error) {
    console.log('%c draw image error', 'color: orangered', error);
  }
}
