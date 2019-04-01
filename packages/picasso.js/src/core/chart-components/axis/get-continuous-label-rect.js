const tickDistance = (rect, start, end) => rect.width * Math.abs(start.position - end.position);

const getLeftEdgeWidth = ({
  innerRect,
  outerRect,
  tick,
  nextWidth
}) => {
  const leftEdgeBleed = innerRect.x - outerRect.x;
  const left = (innerRect.width * tick.position) + leftEdgeBleed;
  const minDubble = Math.min(nextWidth, left) * 2;

  return Math.max(nextWidth, minDubble);
};

const getRightEdgeWidth = ({
  innerRect,
  outerRect,
  tick,
  prevWidth
}) => {
  const leftEdgeBleed = innerRect.x - outerRect.x;
  const rightEdgeBleed = (outerRect.width - innerRect.width) - leftEdgeBleed;
  const right = (innerRect.width - (innerRect.width * tick.position)) + rightEdgeBleed;
  const minDubble = Math.min(prevWidth, right) * 2;

  return Math.max(prevWidth, minDubble);
};

export default function getHorizontalWidth({
  layered,
  major,
  innerRect,
  outerRect,
  tick,
  index
}) {
  const PADDING = 2;
  const step = layered ? 2 : 1;
  const prev = major[index - step];
  const next = major[index + step];
  const prevWidth = prev ? (tickDistance(innerRect, tick, prev) / 2) - PADDING : Infinity;
  const nextWidth = next ? (tickDistance(innerRect, tick, next) / 2) - PADDING : Infinity;

  if (major.length < 2) {
    return innerRect.width;
  }

  if (!prev) {
    return getLeftEdgeWidth({
      innerRect,
      outerRect,
      tick,
      nextWidth
    });
  }

  if (!next) {
    return getRightEdgeWidth({
      innerRect,
      outerRect,
      tick,
      prevWidth
    });
  }

  return Math.min(prevWidth, nextWidth) * 2;
}
