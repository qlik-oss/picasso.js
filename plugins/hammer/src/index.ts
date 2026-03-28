/* global Hammer */

/** Minimal interface for a HammerJS Manager instance */
interface HammerManager {
  add(recognizer: unknown): void;
  on(event: string, handler: (e: unknown) => void): void;
  off(event: string, handler: (e: unknown) => void): void;
  get(event: string): { recognizeWith(events: string[]): void; requireFailure(events: string[]): void } | null;
  remove(event: string): void;
  destroy(): void;
}

declare const Hammer: {
  Manager: new (element: Element, options?: Record<string, unknown>) => HammerManager;
  [key: string]: unknown;
};
import hammer from './hammer';

interface PicassoApi {
  interaction(name: string, handler: (chart: unknown, mediator: unknown, element: Element) => unknown): void;
}

export default function initialize(
  picassoOrHammer: PicassoApi | { [key: string]: unknown },
): ((picasso: PicassoApi) => void) | undefined {
  const isPicasso = typeof (picassoOrHammer as any).interaction === 'function';
  if (!isPicasso) {
    return (picasso: PicassoApi): void => {
      picasso.interaction('hammer', hammer(picassoOrHammer as any));
    };
  }
  (picassoOrHammer as PicassoApi).interaction('hammer', hammer(Hammer));
  return undefined;
}
