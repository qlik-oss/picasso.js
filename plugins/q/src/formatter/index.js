import numberFormat from './numberFormat';
import timeFormat from './timeFormat';

export { numberFormat, timeFormat };

export function createFromMetaInfo(meta, localeInfo) {
  if (meta && meta.qNumFormat && ['D', 'T', 'TS', 'IV'].indexOf(meta.qNumFormat.qType) !== -1) {
    return timeFormat(meta.qNumFormat.qFmt, meta.qNumFormat.qType, localeInfo);
  }
  let pattern = '#';
  let thousand = localeInfo && typeof localeInfo.qThousandSep !== 'undefined' ? localeInfo.qThousandSep : ',';
  let decimal = localeInfo && typeof localeInfo.qDecimalSep !== 'undefined' ? localeInfo.qDecimalSep : '.';
  let type = 'U';
  let isAuto = meta && !!meta.qIsAutoFormat;
  if (meta && meta.qNumFormat) {
    pattern = meta.qNumFormat.qFmt || pattern;
    thousand = meta.qNumFormat.qThou || thousand;
    decimal = meta.qNumFormat.qDec || decimal;
    type = meta.qNumFormat.qType || type;
    isAuto = isAuto && ['M'].indexOf(meta.qNumFormat.qType) === -1;
  } else {
    isAuto = true;
  }

  if (isAuto || type === 'U') {
    pattern = `#${decimal}##A`;
    type = 'U';
  }

  return numberFormat(pattern, thousand, decimal, type, localeInfo);
}
