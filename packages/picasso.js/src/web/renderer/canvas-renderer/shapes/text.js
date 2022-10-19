import { ellipsText, measureText } from '../../../text-manipulation';
import baselineHeuristic from '../../../text-manipulation/baseline-heuristic';
import { detectTextDirection, flipTextAnchor } from '../../../../core/utils/rtl-util';

export default function render(t, { g, ellipsed }) {
  const text = ellipsed || ellipsText(t, measureText);
  g.font = `${t['font-weight']} ${t['font-size']} ${t['font-family']}`;

  const dir = detectTextDirection(t.text);
  if (g.canvas.dir !== dir) {
    g.canvas.dir = dir;
  }
  const textAnchor = t['text-anchor'] === 'middle' ? 'center' : t['text-anchor'];
  const textAlign = flipTextAnchor(textAnchor, g.canvas.dir);
  if (textAlign && g.textAlign !== textAlign) {
    g.textAlign = textAlign;
  }

  const bdy = baselineHeuristic(t);

  g.fillText(text, t.x + t.dx, t.y + t.dy + bdy);
  if (t.stroke) {
    g.strokeText(text, t.x + t.dx, t.y + t.dy + bdy);
  }
}
