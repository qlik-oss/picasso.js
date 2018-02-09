const MIN_REQ_OUTER_WIDTH = 60;
const MIN_REQ_MINOR_WIDTH = 16;

function findNonQualified(ary, start) {
  if (start >= ary.length) {
    return null;
  }

  for (let i = start; i < ary.length; i++) {
    if (ary[i].qTags.indexOf('$qualified') === -1) {
      return i;
    }
  }
  return null;
}

export default function resolveLevels({ data, settings }) {
  const maxWidth = settings.maxWidth;
  const measureText = settings.measureText;

  const outer = { index: null, minor: null }; // minor === inner if available
  const inner = { index: null, minor: null };

  if (!Array.isArray(data)) {
    return { outer, inner };
  }

  for (let o = data.length - 1; o >= 0; o--) {
    const qOuter = data[o];
    const qOuterWidthAvailablePerTick = maxWidth / qOuter.qTicks.length;

    if (qOuterWidthAvailablePerTick > MIN_REQ_OUTER_WIDTH && qOuter.qTags.indexOf('$hidden') === -1) {
      const i = findNonQualified(data, o + 1);
      const qInner = data[i];
      const qInnerTotalWidth = qInner ? qInner.qTicks
        .reduce((prev, curr) => prev + measureText({ text: curr.qText, fontSize: '16px', fontFamily: 'Arial' }).width, 0) : 0;

      if (qInnerTotalWidth < maxWidth) {
        outer.index = o;
        inner.index = i;
        outer.minor = inner.index;
        inner.minor = i !== null ? findNonQualified(data, inner.index + 1) : null;
        if (inner.minor !== null && (maxWidth / data[inner.minor].qTicks.length) < MIN_REQ_MINOR_WIDTH) {
          inner.minor = null;
        }
        break;
      }
    }
  }

  if (outer.index === null && data.length > 0) {
    outer.index = 0; // Fallback to first level (ex. year)
  }

  return { outer, inner };
}
