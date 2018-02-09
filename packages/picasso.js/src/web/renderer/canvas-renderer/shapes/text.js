import { ellipsText, measureText } from '../../../text-manipulation';
import baselineHeuristic from '../../../text-manipulation/baseline-heuristic';
import { detectTextDirection, flipTextAnchor } from '../../../../core/utils/rtl-util';

export default function render(t, { g }) {
  const text = ellipsText(t, measureText);

  g.font = `${t['font-size']} ${t['font-family']}`;
  g.canvas.dir = detectTextDirection(t.text);
  const textAlign = t['text-anchor'] === 'middle' ? 'center' : t['text-anchor'];
  g.textAlign = flipTextAnchor(textAlign, g.canvas.dir);

  const bdy = baselineHeuristic(t);

  g.fillText(text, t.x + t.dx, t.y + t.dy + bdy);
}
