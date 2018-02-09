const creators = [];

 /**
  * Color instantiator
  * @private
  * @param { ...Object } ...c The color representation, can be any type that is recognized by a registered color instantiator
  * @return { RgbaColor | HslaColor } Color instance, the type returned depends on the color instantiator that recognizes the color
  * @example
  * color( "#fff" );
  * color( "rgb(0, 0, 0)" );
  * color( "hsl(0, 50%, 50%)" );
  * color( "red" );
  */
function color(...c) {
  for (let i = 0; i < creators.length; i++) {
    if (creators[i].test(...c)) {
      return creators[i].fn(...c);
    }
  }

  return undefined;
}

/**
 * Register a color instantiator
 * @memberof picasso.color
 * @private
 * @param  { Function } test The function that test if a color is recognized
 * @param  { Function } fn   The function that instanciates a new color instance
 * @example
 * let fn = () => {
 *   return {
 *     r: Math.floor(Math.random()*255),
 *     g: Math.floor(Math.random()*255),
 *     b: Math.floor(Math.random()*255)
 *   };
 * };
 *
 * let fnTest = c => c === "surprise";
 * color.register( fnTest, fn );
 *
 * let someColor = color("surprise");
 */
color.register = (test, fn) => {
  creators.push({ test, fn });
};

/**
 * Extend the color function with new methods
 * @memberof picasso.color
 * @private
 * @param  { String } name Name of the property
 * @param  { Object } obj Object to extend with
 * @example
 * let fn = () => {
 *   return color( {
 *     r: Math.floor(Math.random()*255),
 *     g: Math.floor(Math.random()*255),
 *     b: Math.floor(Math.random()*255)
 *   } );
 * };
 *
 * color.extend( "randomColor", fn );
 * color.randomColor();
 */
color.extend = (name, obj) => {
  if (color[name] !== undefined) {
    throw new Error(`Property already exist with name: ${name}`);
  }
  color[name] = obj;
};

export default color;
