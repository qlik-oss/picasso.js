import { scaleTime as d3ScaleTime } from 'd3-scale';
import { createFromMetaInfo } from '../../formatter';
import { QlikTimeToDate } from '../../formatter/timeFormat';

const UNIX_DATE_COMP_DAYS = 25569;
const HOUR_PATTERN = 'hh:mm';
const MINUTE_PATTERN = 'hh:mm:ss';

function DateToQlikTimestamp(date) {
  const offset = (date.getTimezoneOffset() / 60 / 24) - UNIX_DATE_COMP_DAYS;
  return ((date.getTime() + 0.5) / 1000 / 86400) - offset;
}

function getFormatter(ticks) {
  let qFmt = HOUR_PATTERN;
  if (ticks.some(date => date.getSeconds() > 0)) {
    qFmt = MINUTE_PATTERN;
  }

  return createFromMetaInfo({ qNumFormat: { qType: 'D', qFmt } });
}

export default function tickGenerator(scale, settings) {
  const timeScale = d3ScaleTime();

  const fn = function fn() {};

  fn.transformTicks = function transformTicks(qTicks) {
    return qTicks.map((qt) => {
      let value = (qt.qStart + qt.qEnd) / 2;
      if (settings.anchor === 'start') {
        value = qt.qStart;
      } else if (settings.anchor === 'end') {
        value = qt.qEnd;
      }

      return {
        value,
        position: scale(value),
        start: scale(qt.qStart),
        end: scale(qt.qEnd),
        label: qt.qText,
        isMinor: false
      };
    });
  };

  fn.createTicks = function createTicks(distance) {
    const d = scale.domain();
    const s = QlikTimeToDate(d[0]);
    const e = QlikTimeToDate(d[1]);
    timeScale.domain([s, e]);

    const ticks = timeScale.ticks(isNaN(distance) ? undefined : distance / 60);
    const formatter = getFormatter(ticks);
    const interval = ticks.length > 1 ? ticks[1] - ticks[0] : 0; // Assumes uniformly-spaced ticks

    return ticks.map((date) => {
      const qtTime = DateToQlikTimestamp(date);
      const start = timeScale(date);
      return {
        position: start,
        start,
        end: timeScale(date.getTime() + interval),
        value: qtTime,
        label: formatter(qtTime),
        isMinor: false
      };
    });
  };

  return fn;
}
