const populateBins = (dataPages) => {
  const bins = [];
  const matrix = dataPages[0].qMatrix;
  let i;

  // Hack for snapshot
  if (dataPages[0].reformatted) {
    for (i = 1; i < matrix.length; i++) {
      try {
        bins.push(matrix[i][0]);
      } catch (err) {
        // console.log( err );
      }
    }
  } else {
    for (i = 1; i < matrix.length; i++) {
      try {
        matrix[i][0].qText = JSON.parse(matrix[i][0].qText);
        bins.push(matrix[i][0]);
      } catch (err) {
        // console.log( err );
      }
    }
    // eslint-disable-next-line no-param-reassign
    dataPages[0].reformatted = true;
  }

  return bins;
};

const mergeRectsByDim = (rects, dim) => {
  if (rects.length === 0) {
    return [];
  }
  const n = rects.length;
  const rects2 = [];
  let j = 0;
  let rect1;
  let rect2;
  const dim2 = dim === 'x' ? 'y' : 'x';
  const min1 = `${dim}Min`;
  const max1 = `${dim}Max`;
  const min2 = `${dim2}Min`;
  const max2 = `${dim2}Max`;
  rects.sort((a, b) => {
    if (a[min1] > b[min1]) {
      return 1;
    }
    if (a[min1] === b[min1]) {
      if (a[min1] === b[min1]) {
        return a[min2] - b[min2];
      }
    } else {
      return -1;
    }
    return undefined;
  });
  rect1 = rects[0];
  rect2 = {
    xMin: rect1.xMin,
    xMax: rect1.xMax,
    yMin: rect1.yMin,
    yMax: rect1.yMax,
  };
  rects2[j] = rect2;
  for (let i = 1; i < n; i++) {
    rect1 = rects[i];
    if (rect2[min1] === rect1[min1] && rect2[max1] === rect1[max1] && rect2[max2] === rect1[min2]) {
      rect2[max2] = rect1[max2];
    } else {
      j++;
      rect2 = {
        xMin: rect1.xMin,
        xMax: rect1.xMax,
        yMin: rect1.yMin,
        yMax: rect1.yMax,
      };
      rects2[j] = rect2;
    }
  }
  return rects2;
};

const getSelectedBins = ({ layout, values }) => {
  const binArray = populateBins([layout.dataPages[0]]);
  const selectedBinArray = [];
  values.forEach((v) => {
    const selectBin = binArray.find(({ qElemNumber }) => qElemNumber === v);
    if (selectBin) {
      selectedBinArray.push(selectBin);
    }
  });
  return selectedBinArray;
};

export default function calculateDataRects({ layout, values }) {
  const selectedBinArray = getSelectedBins({ layout, values });
  let len = selectedBinArray ? selectedBinArray.length : 0;
  const rects = new Array(len);
  const result = [];
  let rect;
  let xMin;
  let xMax;
  let yMin;
  let yMax;
  let xRange;
  let yRange;
  for (let i = 0; i < len; i++) {
    rect = selectedBinArray[i].qText;
    xMin = Math.min(rect[0], rect[2]);
    yMin = Math.min(rect[1], rect[3]);
    xMax = Math.max(rect[0], rect[2]);
    yMax = Math.max(rect[1], rect[3]);
    rects[i] = {
      xMin,
      xMax,
      yMin,
      yMax,
    };
  }
  const mergedRectsByXY = mergeRectsByDim(mergeRectsByDim(rects, 'x'), 'y');
  const mergedRectsByYX = mergeRectsByDim(mergeRectsByDim(rects, 'y'), 'x');
  const mergedRects = mergedRectsByXY.length > mergedRectsByYX.length ? mergedRectsByYX : mergedRectsByXY;
  len = mergedRects.length;
  for (let i = 0; i < len; i++) {
    rect = mergedRects[i];
    xRange = {
      idx: 0,
      range: { max: rect.xMax, min: rect.xMin },
      type: 'measure',
    };
    yRange = {
      idx: 1,
      range: { max: rect.yMax, min: rect.yMin },
      type: 'measure',
    };
    result[i] = [xRange, yRange];
  }
  return result;
}
