import timeFormat from '../timeFormat';

describe('d3 timeFormat', () => {
  it('should format dates correctly according to constructor pattern', () => {
    const formatter = timeFormat('%B %d, %Y');

    expect(formatter(new Date(2013, 10, 18))).to.equal('November 18, 2013');
  });

  it('should format dates correctly when using custom format', () => {
    const formatter = timeFormat('%B %d, %Y');

    expect(formatter.format('%Y-%m-%d', new Date(2013, 10, 18))).to.equal('2013-11-18');
  });

  it('should format dates correctly with a custom locale', () => {
    const formatter = timeFormat('%A, %B %d, %Y');

    expect(formatter(new Date(2013, 10, 18))).to.equal('Monday, November 18, 2013');

    formatter.locale({
      dateTime: '%A den %d %B %Y %X',
      date: '%Y-%m-%d',
      time: '%H:%M:%S',
      periods: ['fm', 'em'],
      days: ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'],
      shortDays: ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'],
      months: ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'],
      shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
    });

    expect(formatter(new Date(2013, 10, 18))).to.equal('Måndag, November 18, 2013');
  });

  it('should parse dates correctly', () => {
    const formatter = timeFormat('%A, %B %d, %Y');

    const parsedDate1 = formatter.parse('%Y-%m-%d', '2013-11-18');
    const parsedDate2 = formatter.parsePattern('%Y-%m-%d')('2013-11-18');

    expect(formatter(parsedDate1)).to.equal('Monday, November 18, 2013');

    expect(formatter(parsedDate2)).to.equal('Monday, November 18, 2013');
  });
});
