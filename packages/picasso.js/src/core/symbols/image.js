/**
 * @extends symbol-config
 * @typedef {object} symbol--image
 */
function image(options) {
    return {
        type: 'image',
        href: options.href,
        x: options.x,
        y: options.y,
        width: options.width,
        height: options.height,
        collider: {
            type: 'image'
        }
  };
}

export {
  image as default
};
