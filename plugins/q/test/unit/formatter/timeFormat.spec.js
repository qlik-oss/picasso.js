import timeFormat, { QlikTimeToDate } from '../../../src/formatter/timeFormat';

/**
 * PLEASE NOTE / WARNING: THIS FUNCTION *MAY* HAVE FLOATING POINT ERRORS
 * IT MIGHT BE OFF BY MILLISECONDS.
 *
 * It also tries to compensate for the milliseonds error by adding a 0.5 ms,
 * which means if you're specifying a date 2013-12-31 59:59:59 and the last millisecond,
 * you *might* end up in 2014.
 */
function DateToQlikTime(value) {
  let offset = QlikTimeToDate(0);

  const off2 = ((offset.getTimezoneOffset() * 60 * 1000) - (value.getTimezoneOffset() * 60 * 1000)) + (offset.getTimezoneOffset() * 60 * 1000);

  offset = offset.setTime(offset.getTime() + (value.getTimezoneOffset() * 60 * 1000));

  return (
    ((value.getTime() - offset) + off2 + 0.5) / (60 * 60 * 24)
  ) / 1000;
}

describe('qlik timeFormat', () => {
  let n;

  describe('Basic', () => {
    it('should format dates correctly according to constructor pattern', () => {
      const formatter = timeFormat('MMMM DD, YYYY');

      expect(formatter('41596')).to.equal('November 18, 2013');
    });

    it('should format dates correctly when using custom format', () => {
      const formatter = timeFormat('MMMM DD, YYYY');

      expect(formatter.format('YYYY-MM-DD', '41596')).to.equal('2013-11-18');
    });

    it('should format dates correctly with a custom locale', () => {
      const formatter = timeFormat('WWWW, MMMM DD, YYYY');

      expect(formatter('41596')).to.equal('Monday, November 18, 2013');

      formatter.locale({ qCalendarStrings: {
        qLongDayNames: ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'],
        qDayNames: ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'],
        qLongMonthNames: ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'],
        qMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
      } });

      expect(formatter('41596')).to.equal('Måndag, November 18, 2013');
    });

    it('should handle locale formats correctly', () => {
      const formatter = timeFormat('', 'D');

      formatter.locale({
        qDateFmt: 'YYYY-MM-DD'
      });

      expect(formatter('41596')).to.equal('2013-11-18');
    });

    it('should handle non-specified locale formats correctly', () => {
      let formatter = timeFormat('', 'TS');

      expect(formatter('41596')).to.equal('2013-11-18 00:00:00');

      formatter = timeFormat('', 'D');

      expect(formatter('41596')).to.equal('2013-11-18');

      formatter = timeFormat('', 'T');

      expect(formatter('41596.5')).to.equal('12:00:00');
    });

    it('should format intervals correctly', () => {
      const formatter = timeFormat('MMMM DD, YYYY', 'IV');

      expect(formatter.format('D', '7')).to.equal('7');
      expect(formatter.format('M', '30')).to.equal('1');
      expect(formatter.format('DD hh', -10.25)).to.equal('-10 06');
    });
  });

  describe('Years', () => {
    it('should format year correctly', () => {
      n = timeFormat();
      let d = DateToQlikTime(new Date(2014, 3, 24, 13, 55, 40, 100)); // thursday 24th april 2014 @ 13:55:40:100

      expect(n.format('Y', d)).to.equal('14');
      expect(n.format('y', d)).to.equal('14');
      expect(n.format('YY', d)).to.equal('14');
      expect(n.format('yy', d)).to.equal('14');
      expect(n.format('YYY', d)).to.equal('014');
      expect(n.format('yyy', d)).to.equal('014');
      expect(n.format('YYYY', d)).to.equal('2014');
      expect(n.format('yyyy', d)).to.equal('2014');
      expect(n.format('YYYYY', d)).to.equal('02014');
      expect(n.format('YYYYYY YY', d)).to.equal('002014 14');

      d = DateToQlikTime(new Date(123401, 11, 1, 13, 55, 40, 100));
      expect(n.format('Y', d)).to.equal('1');
      expect(n.format('YY', d)).to.equal('01');
      expect(n.format('YYY', d)).to.equal('401');
      expect(n.format('YYYY', d)).to.equal('123401'); // four letter -> full year
    });
  });

  describe('Months', () => {
    let _0,
      _1,
      _2,
      _3,
      _4,
      _5,
      _6,
      _7,
      _8,
      _9,
      _10,
      _11;
    beforeEach(() => {
      n = timeFormat();
      _0 = DateToQlikTime(new Date(2014, 0, 1));
      _1 = DateToQlikTime(new Date(2014, 1, 1));
      _2 = DateToQlikTime(new Date(2014, 2, 1));
      _3 = DateToQlikTime(new Date(2014, 3, 1));
      _4 = DateToQlikTime(new Date(2014, 4, 1));
      _5 = DateToQlikTime(new Date(2014, 5, 1));
      _6 = DateToQlikTime(new Date(2014, 6, 1));
      _7 = DateToQlikTime(new Date(2014, 7, 1));
      _8 = DateToQlikTime(new Date(2014, 8, 1));
      _9 = DateToQlikTime(new Date(2014, 9, 1));
      _10 = DateToQlikTime(new Date(2014, 10, 1));
      _11 = DateToQlikTime(new Date(2014, 11, 1));
    });

    it('as number', () => {
      n = timeFormat('M');
      expect(n(_0)).to.equal('1');
      expect(n(_1)).to.equal('2');
      expect(n(_2)).to.equal('3');
      expect(n(_3)).to.equal('4');
      expect(n(_4)).to.equal('5');
      expect(n(_5)).to.equal('6');
      expect(n(_6)).to.equal('7');
      expect(n(_7)).to.equal('8');
      expect(n(_8)).to.equal('9');
      expect(n(_9)).to.equal('10');
      expect(n(_10)).to.equal('11');
      expect(n(_11)).to.equal('12');
    });

    it('as padded number', () => {
      n = timeFormat('MM');
      expect(n(_0)).to.equal('01');
      expect(n(_1)).to.equal('02');
      expect(n(_2)).to.equal('03');
      expect(n(_3)).to.equal('04');
      expect(n(_4)).to.equal('05');
      expect(n(_5)).to.equal('06');
      expect(n(_6)).to.equal('07');
      expect(n(_7)).to.equal('08');
      expect(n(_8)).to.equal('09');
      expect(n(_9)).to.equal('10');
      expect(n(_10)).to.equal('11');
      expect(n(_11)).to.equal('12');
    });

    it('in short form', () => {
      n = timeFormat('MMM');
      expect(n(_0)).to.equal('Jan');
      expect(n(_1)).to.equal('Feb');
      expect(n(_2)).to.equal('Mar');
      expect(n(_3)).to.equal('Apr');
      expect(n(_4)).to.equal('May');
      expect(n(_5)).to.equal('Jun');
      expect(n(_6)).to.equal('Jul');
      expect(n(_7)).to.equal('Aug');
      expect(n(_8)).to.equal('Sep');
      expect(n(_9)).to.equal('Oct');
      expect(n(_10)).to.equal('Nov');
      expect(n(_11)).to.equal('Dec');
    });

    it('in long form', () => {
      n = timeFormat('MMMM');
      expect(n(_0)).to.equal('January');
      expect(n(_1)).to.equal('February');
      expect(n(_2)).to.equal('March');
      expect(n(_3)).to.equal('April');
      expect(n(_4)).to.equal('May');
      expect(n(_5)).to.equal('June');
      expect(n(_6)).to.equal('July');
      expect(n(_7)).to.equal('August');
      expect(n(_8)).to.equal('September');
      expect(n(_9)).to.equal('October');
      expect(n(_10)).to.equal('November');
      expect(n(_11)).to.equal('December');
    });
  });

  describe('Weekdays', () => {
    let mon,
      tue,
      wed,
      thu,
      fri,
      sat,
      sun;
    beforeEach(() => {
      n = timeFormat(null);
      mon = DateToQlikTime(new Date(2014, 0, 6));
      tue = DateToQlikTime(new Date(2014, 0, 7));
      wed = DateToQlikTime(new Date(2014, 0, 8));
      thu = DateToQlikTime(new Date(2014, 0, 9));
      fri = DateToQlikTime(new Date(2014, 0, 10));
      sat = DateToQlikTime(new Date(2014, 0, 11));
      sun = DateToQlikTime(new Date(2014, 0, 12));
    });

    it('as number', () => {
      n = timeFormat('W');
      expect(n(mon)).to.equal('0'); // Mon 6th January 2014
      expect(n(tue)).to.equal('1'); // Tue 7th January 2014
      expect(n(wed)).to.equal('2'); // Wed 8th January 2014
      expect(n(thu)).to.equal('3'); // Thu 9th January 2014
      expect(n(fri)).to.equal('4'); // Fri 10th January 2014
      expect(n(sat)).to.equal('5'); // Sat 11th January 2014
      expect(n(sun)).to.equal('6'); // Sun 12th January 2014
    });

    it('as number (small)', () => {
      n = timeFormat('w');
      expect(n(mon)).to.equal('0'); // Mon 6th January 2014
      expect(n(tue)).to.equal('1'); // Tue 7th January 2014
      expect(n(wed)).to.equal('2'); // Wed 8th January 2014
      expect(n(thu)).to.equal('3'); // Thu 9th January 2014
      expect(n(fri)).to.equal('4'); // Fri 10th January 2014
      expect(n(sat)).to.equal('5'); // Sat 11th January 2014
      expect(n(sun)).to.equal('6'); // Sun 12th January 2014
    });

    it('as padded number', () => {
      n = timeFormat('WW');
      expect(n(mon)).to.equal('00'); // Mon 6th January 2014
      expect(n(tue)).to.equal('01'); // Tue 7th January 2014
      expect(n(wed)).to.equal('02'); // Wed 8th January 2014
      expect(n(thu)).to.equal('03'); // Thu 9th January 2014
      expect(n(fri)).to.equal('04'); // Fri 10th January 2014
      expect(n(sat)).to.equal('05'); // Sat 11th January 2014
      expect(n(sun)).to.equal('06'); // Sun 12th January 2014
    });

    it('as padded number (small)', () => {
      n = timeFormat('ww');
      expect(n(mon)).to.equal('00'); // Mon 6th January 2014
      expect(n(tue)).to.equal('01'); // Tue 7th January 2014
      expect(n(wed)).to.equal('02'); // Wed 8th January 2014
      expect(n(thu)).to.equal('03'); // Thu 9th January 2014
      expect(n(fri)).to.equal('04'); // Fri 10th January 2014
      expect(n(sat)).to.equal('05'); // Sat 11th January 2014
      expect(n(sun)).to.equal('06'); // Sun 12th January 2014
    });

    it('in short form', () => {
      n = timeFormat('WWW');
      expect(n(mon)).to.equal('Mon'); // Mon 6th January 2014
      expect(n(tue)).to.equal('Tue'); // Tue 7th January 2014
      expect(n(wed)).to.equal('Wed'); // Wed 8th January 2014
      expect(n(thu)).to.equal('Thu'); // Thu 9th January 2014
      expect(n(fri)).to.equal('Fri'); // Fri 10th January 2014
      expect(n(sat)).to.equal('Sat'); // Sat 11th January 2014
      expect(n(sun)).to.equal('Sun'); // Sun 12th January 2014
    });

    it('in short form (small)', () => {
      n = timeFormat('www');
      expect(n(mon)).to.equal('Mon'); // Mon 6th January 2014
      expect(n(tue)).to.equal('Tue'); // Tue 7th January 2014
      expect(n(wed)).to.equal('Wed'); // Wed 8th January 2014
      expect(n(thu)).to.equal('Thu'); // Thu 9th January 2014
      expect(n(fri)).to.equal('Fri'); // Fri 10th January 2014
      expect(n(sat)).to.equal('Sat'); // Sat 11th January 2014
      expect(n(sun)).to.equal('Sun'); // Sun 12th January 2014
    });

    it('in long form', () => {
      n = timeFormat('WWWW');
      expect(n(mon)).to.equal('Monday'); // Mon 6th January 2014
      expect(n(tue)).to.equal('Tuesday'); // Tue 7th January 2014
      expect(n(wed)).to.equal('Wednesday'); // Wed 8th January 2014
      expect(n(thu)).to.equal('Thursday'); // Thu 9th January 2014
      expect(n(fri)).to.equal('Friday'); // Fri 10th January 2014
      expect(n(sat)).to.equal('Saturday'); // Sat 11th January 2014
      expect(n(sun)).to.equal('Sunday'); // Sun 12th January 2014
    });

    it('in long form (small)', () => {
      n = timeFormat('wwww');
      expect(n(mon)).to.equal('Monday'); // Mon 6th January 2014
      expect(n(tue)).to.equal('Tuesday'); // Tue 7th January 2014
      expect(n(wed)).to.equal('Wednesday'); // Wed 8th January 2014
      expect(n(thu)).to.equal('Thursday'); // Thu 9th January 2014
      expect(n(fri)).to.equal('Friday'); // Fri 10th January 2014
      expect(n(sat)).to.equal('Saturday'); // Sat 11th January 2014
      expect(n(sun)).to.equal('Sunday'); // Sun 12th January 2014
    });
  });

  describe('Day', () => {
    let _1,
      _15,
      _31;
    beforeEach(() => {
      n = timeFormat(null);
      _1 = DateToQlikTime(new Date(2014, 0, 1));
      _15 = DateToQlikTime(new Date(2014, 0, 15));
      _31 = DateToQlikTime(new Date(2014, 0, 31));
    });

    it('as number', () => {
      n = timeFormat('D');
      expect(n(_1)).to.equal('1');
      expect(n(_15)).to.equal('15');
      expect(n(_31)).to.equal('31');

      n = timeFormat('d');
      expect(n(_1)).to.equal('1');
      expect(n(_15)).to.equal('15');
      expect(n(_31)).to.equal('31');
    });

    it('as padded number', () => {
      n = timeFormat('DD');
      expect(n(_1)).to.equal('01');
      expect(n(_15)).to.equal('15');
      expect(n(_31)).to.equal('31');

      n = timeFormat('dd');
      expect(n(_1)).to.equal('01');
      expect(n(_15)).to.equal('15');
      expect(n(_31)).to.equal('31');

      expect(n.format('DDD ddd dd d', _31)).to.equal('031 031 31 31');
    });
  });

  describe('Combinations', () => {
    it('should support combinations of year, month, weekday and day', () => {
      n = timeFormat(null);
      const d = DateToQlikTime(new Date(2014, 3, 24, 13, 55, 40, 100)); // thursday 24th april 2014 @ 13:55:40:100

      expect(n.format('YYYY-MM-DD', d)).to.equal('2014-04-24');
      expect(n.format('DD/MM -YY', d)).to.equal('24/04 -14');
      expect(n.format('wwww MMMM dd YYYY', d)).to.equal('Thursday April 24 2014');
    });
  });


  describe('Time', () => {
    let midnight,
      midnight59,
      midnight60,
      preNoon,
      noon,
      noon59,
      noon60;
    beforeEach(() => {
      n = timeFormat(null);
      midnight = 41753; // 00:00:00 -> 12:00:00 am
      midnight59 = 41753.0416600; // 00:59:00 -> 12:59:00 am
      midnight60 = 41753.0416700; // 01:00:00 -> 1:00:00 am
      preNoon = 41753.499309; // 11:59:00 -> 11:59:00 am
      noon = 41753.5; // 12:00:00 -> 12:00:00 pm
      noon59 = 41753.54098; // 12:59:00 -> 12:59:00 pm
      noon60 = 41753.54167; // 13:00:00 -> 1:00:00 pm
    });

    describe('Hours', () => {
      it('as number', () => {
        expect(n.format('h', midnight)).to.equal('0');
        expect(n.format('H', midnight)).to.equal('0');
        expect(n.format('h', preNoon)).to.equal('11');
        expect(n.format('H', preNoon)).to.equal('11');
      });

      it('as padded number', () => {
        expect(n.format('hh', midnight)).to.equal('00');
        expect(n.format('HH', midnight)).to.equal('00');
        expect(n.format('hh', preNoon)).to.equal('11');
        expect(n.format('HH', preNoon)).to.equal('11');
      });

      it('in 12-hour format', () => {
        expect(n.format('h tt', midnight)).to.equal('12 am');
        expect(n.format('h tt', midnight59)).to.equal('12 am');
        expect(n.format('h tt', midnight60)).to.equal('1 am');
        expect(n.format('h tt', preNoon)).to.equal('11 am');
        expect(n.format('h TT', noon)).to.equal('12 PM');
        expect(n.format('h tT', noon59)).to.equal('12 pP');
        expect(n.format('h Tt', noon60)).to.equal('1 Pp');

        expect(n.format('ttTTTttTt', noon)).to.equal('pmPMPpmPp');
      });
    });

    describe('Minutes', () => {
      it('as number', () => {
        expect(n.format('m', midnight)).to.equal('0');
        expect(n.format('m', midnight59)).to.equal('59');
      });

      it('as padded number', () => {
        expect(n.format('mm', midnight)).to.equal('00');
        expect(n.format('mmm', midnight)).to.equal('000');
        expect(n.format('mmmm mm', midnight)).to.equal('0000 00');

        expect(n.format('mm', midnight59)).to.equal('59');
        expect(n.format('mmm', midnight59)).to.equal('059');
        expect(n.format('mmmm mm', midnight59)).to.equal('0059 59');
      });
    });

    describe('Seconds', () => {
      it('as number', () => {
        expect(n.format('s', midnight)).to.equal('0');
        expect(n.format('S', midnight)).to.equal('0');

        expect(n.format('s', midnight59)).to.equal('59');
        expect(n.format('S', midnight59)).to.equal('59');
      });

      it('as padded number', () => {
        expect(n.format('ss', midnight)).to.equal('00');
        expect(n.format('SS', midnight)).to.equal('00');

        expect(n.format('ss', midnight59)).to.equal('59');
        expect(n.format('SS', midnight59)).to.equal('59');

        expect(n.format('SSS ss s', midnight59)).to.equal('059 59 59');
      });
    });

    describe('Fractions', () => {
      it(' ', () => {
        const d = DateToQlikTime(new Date(2014, 0, 1, 0, 0, 0, 456));
        expect(n.format('f F', d)).to.equal('4 4'); // tenths of a second
        expect(n.format('ff', d)).to.equal('45'); // hundreths of a second
        expect(n.format('fff FFF', d)).to.equal('456 456'); // tousandths of a second
        expect(n.format('ffff', d)).to.equal('4560'); // ten thousandths of a second
        expect(n.format('fffff', d)).to.equal('45600'); // hundred thousandths of a second
        expect(n.format('ffffff', d)).to.equal('456000'); // millionths of a second
      });
    });

    it('should support combinations of hours, minutes, seconds and fractions', () => {
      const d = 41753.58033550347;
      // let d = DateToQlikTime(new Date(2014, 3, 24, 13, 55, 40, 987));

      expect(n.format('h:m:s', midnight)).to.equal('0:0:0');
      expect(n.format('hh:mm:ss', midnight)).to.equal('00:00:00');

      expect(n.format('h:m:s', noon59)).to.equal('12:59:0');
      expect(n.format('hh:mm:ss', noon59)).to.equal('12:59:00');

      expect(n.format('h:m:s tt', noon59)).to.equal('12:59:0 pm');
      expect(n.format('h:m:s[.fff]][', noon59)).to.equal('12:59:0');

      // expect( n.format( new Date( 2014, 0, 1, 13, 55, 30, 123 ), 'h:m:s[.ffff]' ) ).to.equal( '13:55.30.1230' ); // TODO?

      expect(n.format('YYYY-MM-DD hh:mm:ss.ffff', d)).to.equal('2014-04-24 13:55:40.9870');
      expect(n.format('DD/MM -YY h:m:s.fff TT', d)).to.equal('24/04 -14 1:55:40.987 PM');

      expect(n.format('WWWW MMMMMM DD YYYY @ hh:mm:ss', d)).to.equal('Thursday April 24 2014 @ 13:55:40');
    });
  });
});
