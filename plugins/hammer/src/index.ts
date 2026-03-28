/* global Hammer */

/** Minimal interface for a HammerJS Manager instance */
interface HammerManager {
  add(recognizer: unknown): void;
  on(event: string, handler: (e: unknown) => void): void;
  off(event: string, handler: (e: unknown) => void): void;
  get(event: string): { recognizeWith(events: string[]): void; requireFailure(events: string[]): void };
  remove(event: string): void;
  destroy(): void;
}

declare const Hammer: {
  Manager: new (element: Element, options?: Record<string, unknown>) => HammerManager;
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
