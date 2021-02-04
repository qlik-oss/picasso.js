import { rendererComponent as canvas } from '../web/renderer/canvas-renderer';
import { rendererComponent as svg } from '../web/renderer/svg-renderer/svg-renderer';
import { rendererComponent as dom } from '../web/renderer/dom-renderer';
import { rendererComponent as deferred } from '../native/deferred-renderer';

export default [svg, canvas, dom, deferred];
