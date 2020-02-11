import { TYPES } from '../constants';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const MONTHS_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SECONDS_PER_DAY = 86400;

function pad(s, n) {
  for (let i = s.length; i < n; i++) {
    s = `0${s}`;
  }
  return s;
}

function parseDate(d, twelveFormat) {
  let h = d.getUTCHours();
  let day = d.getUTCDay() - 1;
  if (twelveFormat) {
    h %= 12;
    if (!h) {
      // h == 0 -> 12
      h = 12;
    }
  }

  if (day < 0) {
    day = 6;
  }

  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth(),
    day,
    date: d.getUTCDate(),
    h,
    m: d.getUTCMinutes(),
    s: d.getUTCSeconds(),
    f: d.getUTCMilliseconds(),
    t: d.getUTCHours() >= 12 ? 'pm' : 'am',
  };
}

function getRemainder(value) {
  let s = value.toString().split('.');
  if (s[1]) {
    s = Number(`0.${s[1]}`);
  } else {
    return 0;
  }
  return s;
}

function parseIntervalDays(days) {
  const d = days;
  const h = 24 * getRemainder(d);
  const m = 60 * getRemainder(h);
  const s = 60 * getRemainder(m);
  const ms = 1000 * getRemainder(s);

  return {
    d: Math.floor(d),
    h: Math.floor(h),
    m: Math.floor(m),
    s: Math.floor(s),
    f: Math.round(ms),
  };
}

function parseInterval(days, pattern) {
  let units = parseIntervalDays(days),
    d = units.d,
    h = units.h,
    m = units.m,
    s = units.s,
    f = units.f,
    w = 0,
    date;

  if (/w+|t+/gi.test(pattern)) {
    date = new Date(
      Date.UTC(1899, 11, 30 + Math.floor(days), 0, 0, Math.round(SECONDS_PER_DAY * (days - Math.floor(days))))
    );
    if (isNaN(date.getTime())) {
      date = null;
    }
  }

  if (!/D+/gi.test(pattern)) {
    h += d * 24;
  }
  if (!/h+/gi.test(pattern)) {
    m += h * 60;
  }
  if (!/m+/gi.test(pattern)) {
    s += m * 60;
  }
  if (/w+/gi.test(pattern)) {
    w = date ? date.getDay() - 1 : 0;
    if (w < 0) {
      w = 6;
    }
  }

  let someT = '';
  if (date) {
    someT = date.getUTCHours() >= 12 ? 'pm' : 'am';
  }

  return {
    year: 0,
    month: 0,
    day: w,
    date: d,
    h,
    m,
    s,
    f,
    t: someT,
  };
}

function getMasks(inst, d) {
  return {
    'Y+|y+': {
      Y: `${Number(`${d.year}`.slice(-2))}`,
      YY: pad(`${d.year}`.slice(-2), 2),
      YYY: pad(`${d.year}`.slice(-3), 3),
      def(m) {
        // default
        return pad(`${d.year}`, m.length);
      },
    },
    'M+': {
      M: d.month + 1,
      MM: pad(`${d.month + 1}`, 2),
      MMM: inst.locale_months_abbr[d.month],
      def: inst.locale_months[d.month],
    },
    'W+|w+': {
      W: d.day,
      WW: pad(`${d.day}`, 2),
      WWW: inst.locale_days_abbr[d.day],
      def: inst.locale_days[d.day],
    },
    'D+|d+': {
      D: d.date,
      def(m) {
        return pad(`${d.date}`, m.length);
      },
    },
    'h+|H+': {
      h: d.h,
      def(m) {
        return pad(`${d.h}`, m.length);
      },
    },
    'm+': {
      m: d.m,
      def(m) {
        return pad(`${d.m}`, m.length);
      },
    },
    's+|S+': {
      s: d.s,
      def(m) {
        return pad(`${d.s}`, m.length);
      },
    },
    'f+|F+': {
      def(m) {
        let f = `${d.f}`,
          n = m.length - f.length;
        if (n > 0) {
          for (let i = 0; i < n; i++) {
            f += '0';
          }
        } else if (n < 0) {
          f = f.slice(0, m.length);
        }
        return f;
      },
    },
    't{1,2}|T{1,2}': {
      def(m) {
        let t = d.t;
        if (m[0].toUpperCase() === m[0]) {
          t = t.toUpperCase();
        }
        t = t.slice(0, m.length);
        return t;
      },
    },
  };
}

class DateFormatter {
  /**
   * @name DateFormatter
   * @constructs
   * @param {Object} localeInfo
   * @param {String} pattern
   */
  constructor(localeInfo, pattern, qtype) {
    const info = localeInfo || {};

    if (!info.qCalendarStrings) {
      info.qCalendarStrings = {
        qLongDayNames: DAYS,
        qDayNames: DAYS_ABBR,
        qLongMonthNames: MONTHS,
        qMonthNames: MONTHS_ABBR,
      };
    }

    this.localeInfo = info;
    this.locale_days = info.qCalendarStrings.qLongDayNames.slice();
    this.locale_days_abbr = info.qCalendarStrings.qDayNames.slice();
    this.locale_months = info.qCalendarStrings.qLongMonthNames.slice();
    this.locale_months_abbr = info.qCalendarStrings.qMonthNames.slice();

    if (!pattern) {
      const patternMap = {
        [TYPES.TIME]: info.qTimeFmt || 'hh:mm:ss',
        [TYPES.DATE]: info.qDateFmt || 'YYYY-MM-DD',
        [TYPES.DATE_TIME]: info.qTimestampFmt || 'YYYY-MM-DD hh:mm:ss',
      };

      pattern = patternMap[qtype];
    }

    this.pattern = pattern;
  }

  clone() {
    const n = new DateFormatter(this.localeInfo, this.pattern);
    n.subtype = this.subtype;
    return n;
  }

  /**
   * Formats a date according to given pattern
   * @param {Date} date The date to format.
   * @param {String} pattern The desired format of the date
   * var d = new Date(2013, 8, 15, 13, 55, 40, 987);
   * var n = new DateFormatter();
   * @example
   * m.format( d, 'YYYY-MM-DD hh:mm:ss.ffff') // 2013-08-15 13:55:40.9870
   * m.format( d, 'h:m:s tt') // 1:55:40 pm
   * m.format( d, 'h:m:s TT') // 1:55:40 PM
   * m.format( d, 'M/D/YYYY') // 8/15/2013
   * m.format( d, 'WWWW DD MMM') // Thursday 15 Aug
   * m.format( d, 'WWW DD MMMM @ hh:mm:ss') // Thu 15 August @ 13:55:40
   */
  format(date, pattern) {
    // Fallback pattern is set in constructor
    if (!pattern) {
      pattern = this.pattern ? this.pattern : 'YYYY-MM-DD hh:mm:ss';
    }

    pattern = pattern.replace(/\[.+]|\[|]/g, '');
    const hasTwelveFlag = /t+/gi.test(pattern);
    let parsedDate;

    if (date instanceof Date) {
      parsedDate = parseDate(date, hasTwelveFlag);
    } else {
      if (date < 0) {
        // parseInterval don't support for negative values
        date = -date;
        pattern = `-${pattern}`;
      }
      parsedDate = parseInterval(date, pattern);
    }
    // remove [] and everything inside it

    const masks = getMasks(this, parsedDate);

    const masksArr = [];
    for (const mask in masks) {
      if (Object.prototype.hasOwnProperty.call(masks, mask)) {
        masksArr.push(mask);
      }
    }
    const dateTimeRegex = new RegExp(masksArr.join('|'), 'g');

    const result = pattern.replace(dateTimeRegex, m => {
      let r;
      let mask;
      for (mask in masks) {
        if (Object.prototype.hasOwnProperty.call(masks, mask)) {
          r = new RegExp(mask);
          if (r.test(m)) {
            break;
          }
        }
      }
      if (!r) {
        return '';
      }
      let value;
      for (const submask in masks[mask]) {
        if (submask === m || submask.toLowerCase() === m) {
          value = masks[mask][submask];
          if (typeof value === 'undefined') {
            value = masks[mask][submask.toLowerCase()];
          }
          break;
        }
      }
      if (typeof value === 'undefined') {
        value = masks[mask].def;
      }

      if (typeof value === 'function') {
        value = value(m);
      }
      return value;
    });
    return result;
  }
}

export default function dateFormatFactory(...args) {
  return new DateFormatter(...args);
}
