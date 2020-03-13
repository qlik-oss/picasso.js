/* global Hammer */
import hammer from './hammer';

export default function initialize(picassoOrHammer) {
  const isPicasso = typeof picassoOrHammer.interaction === 'function';
  if (!isPicasso) {
    return picasso => {
      picasso.interaction('hammer', hammer(picassoOrHammer));
    };
  }
  picassoOrHammer.interaction('hammer', hammer(Hammer));
  return undefined;
}
