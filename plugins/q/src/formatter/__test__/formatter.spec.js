import { createFromMetaInfo } from '..';

const qLocaleInfo = {
  qDecimalSep: ',',
  qThousandSep: ' ',
  qListSep: ';',
  qMoneyDecimalSep: ',',
  qMoneyThousandSep: '.',
  qCurrentYear: 2017,
  qMoneyFmt: '#.##0,00 kr;-#.##0,00 kr',
  qTimeFmt: 'hh:mm:ss',
  qDateFmt: 'YYYY-MM-DD',
  qTimestampFmt: 'YYYY-MM-DD hh:mm:ss[.fff]',
  qCalendarStrings: {
    qDayNames: [
      'mån',
      'tis',
      'ons',
      'tor',
      'fre',
      'lör',
      'sön'
    ],
    qMonthNames: [
      'jan',
      'feb',
      'mar',
      'apr',
      'maj',
      'jun',
      'jul',
      'aug',
      'sep',
      'okt',
      'nov',
      'dec'
    ],
    qLongDayNames: [
      'måndag',
      'tisdag',
      'onsdag',
      'torsdag',
      'fredag',
      'lördag',
      'söndag'
    ],
    qLongMonthNames: [
      'januari',
      'februari',
      'mars',
      'april',
      'maj',
      'juni',
      'juli',
      'augusti',
      'september',
      'oktober',
      'november',
      'december'
    ]
  },
  qFirstWeekDay: 0,
  qReferenceDay: 4,
  qFirstMonthOfYear: 1,
  qCollation: 'sv-SE'
};

describe('qs-formatter', () => {
  it('should create a numeric formatter by default', () => {
    const f = createFromMetaInfo();
    expect(f.pattern()).to.equal('#.##A');
  });
  it('should create an abbreviation formatter when qIsAutoFormat=true', () => {
    const f = createFromMetaInfo({
      qIsAutoFormat: true,
      qNumFormat: {}
    });
    expect(f.pattern()).to.equal('#.##A');
  });
  it('should create an abbreviation formatter when qNumFormat.qType=U', () => {
    const f = createFromMetaInfo({
      qIsAutoFormat: false,
      qNumFormat: {
        qType: 'U'
      }
    });
    expect(f.pattern()).to.equal('#.##A');
  });

  it('should not create an abbreviation formatter when qType="M"', () => {
    const f = createFromMetaInfo({
      qNumFormat: {
        qType: 'M',
        qFmt: 'money!'
      },
      qIsAutoFormat: true
    });
    expect(f.pattern()).to.equal('money!');
  });

  it('should create locale specific numeric pattern', () => {
    const f = createFromMetaInfo({
      qIsAutoFormat: true
    }, {
      qDecimalSep: 'dec'
    });
    expect(f.pattern()).to.equal('#dec##A');
  });

  it('should create locale specific date pattern', () => {
    const f = createFromMetaInfo({
      qNumFormat: {
        qType: 'D',
        qFmt: 'YYYY MMMM WWWW'
      },
      qIsAutoFormat: true
    }, qLocaleInfo);
    expect(f(3)).to.equal('1900 januari tisdag');
  });

  it('should use default values if localeInfo object is empty', () => {
    const f = createFromMetaInfo({
      qNumFormat: {
        qIsAutoFormat: true
      },
      qIsAutoFormat: true
    }, {});
    expect(f(3)).to.equal('3');
  });
});
