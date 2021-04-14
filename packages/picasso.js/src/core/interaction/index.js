import registry from '../utils/registry';
import native from '../../web/interactions/native';

/**
 * @typedef {object} InteractionSettings
 * @property {string} type Type of interaction handler
 * @property {string} [key] Unique key identifing the handler
 * @property {function|boolean} enable Enable or disable the interaction handler. If a callback function is provided, it must return either true or false
 * @example
 * {
 *  type: 'native',
 *  key: 'nativeHandler',
 *  enable: () => true,
 *  events: { // "events" is a property specific to the native handler
 *    mousemove: (e) => console.log('mousemove', e),
 *  }
 * }
 */

const reg = registry();

reg('native', native);

export default reg;
