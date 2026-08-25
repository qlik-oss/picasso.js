import hex from './instantiator/hex';
import rgb from './instantiator/rgb';
import hsl from './instantiator/hsl';
import colorKeyWord from './instantiator/color-keyword';
import colorObject from './instantiator/color-object';
import colourUtils from './utils';
import color from './color';
import palettes from './palettes';

export default color;

color.register(hex.test, hex);
color.register(rgb.test, rgb);
color.register(hsl.test, hsl);
color.register(colorKeyWord.test, colorKeyWord);
color.register(colorObject.test, colorObject);

color.extend('palettes', palettes);
color.extend('utils', colourUtils);
