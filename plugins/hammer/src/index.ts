/* global Hammer */
declare const Hammer: {
  Manager: new (element: Element, options?: Record<string, unknown>) => unknown;
  [key: string]: unknown;
};
import hammer from './hammer';

export default function initialize(picassoOrHammer) {
  const isPicasso = typeof picassoOrHammer.interaction === 'function';
  if (!isPicasso) {
    return (picasso) => {
      picasso.interaction('hammer', hammer(picassoOrHammer));
    };
  }
  picassoOrHammer.interaction('hammer', hammer(Hammer));
  return undefined;
}
