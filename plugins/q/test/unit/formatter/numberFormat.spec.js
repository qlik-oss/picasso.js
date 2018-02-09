import formatter from '../../../src/formatter/numberFormat';

describe('numberFormat', () => {
  describe('formatter', () => {
    let f;

    it('should return the correct formatter api', () => {
      f = formatter();

      expect(Object.keys(f).length).to.equal(2);
      expect(Object.prototype.hasOwnProperty.call(f, 'format')).to.equal(true);
      expect(Object.prototype.hasOwnProperty.call(f, 'pattern')).to.equal(true);
      expect(typeof f === 'function').to.equal(true);
    });

    describe('with arguments specified at construction', () => {
      describe('format', () => {
        it('should format scientific notation', () => {
          f = formatter('###0', '', ',');

          expect(f(1.5e+24)).to.equal('1,5e+24');
          expect(f(1.567e+33)).to.equal('1,567e+33');
          expect(f(1e-107)).to.equal('1e-107');
        });

        it('numbers >= 1e15 should always be formatted in scientific notation', () => {
          f = formatter('#', ',', '.');

          expect(f(1.123e15)).to.equal('1e+15');

          f = formatter('0', ',', '.');

          expect(f(1.123e15)).to.equal('1.123e+15');
        });

        it('should round values correctly when type is "I"', () => {
          f = formatter('0', ',', '.', 'I');

          expect(f(0.3)).to.equal('0');
          expect(f(-0.3)).to.equal('0');
          expect(f(-0.6)).to.equal('-1');
        });

        it('should round values correctly when type is "I"', () => {
          f = formatter('0.00', ',', '.', 'I');
          expect(f(0.25)).to.equal('0.00');
          expect(f(0.75)).to.equal('1.00');
          expect(f(1.25)).to.equal('1.00');
          expect(f(1.75)).to.equal('2.00');
        });

        it('should round values correctly when type is "F"', () => {
          f = formatter('0', ',', '.', 'F');

          expect(f(0.3)).to.equal('0');
          expect(f(-0.3)).to.equal('0');
          expect(f(-0.6)).to.equal('-1');
        });

        it('should use significant digits from pattern when decimal pattern is not defined', () => {
          f = formatter('#', ',', '.');

          expect(f(1)).to.equal('1');
          expect(f(15)).to.equal('2e+1');
          expect(f(145)).to.equal('1e+2');
          expect(f(155)).to.equal('2e+2');
          expect(f(0.1)).to.equal('0.1');
          expect(f(0.12345)).to.equal('0.1');
          expect(f(0.00099)).to.equal('0.001');
          expect(f(0.00001)).to.equal('1e-5');
          expect(f(1.2345)).to.equal('1');
          expect(f(1e2)).to.equal('1e+2');
          expect(f(99.123)).to.equal('1e+2');

          f = formatter('##', ',', '.');

          expect(f(0.12345)).to.equal('0.12');
          expect(f(1.2345)).to.equal('1.2');
          expect(f(99.123)).to.equal('99');

          f = formatter('###', ',', '.');

          expect(f(1.2345)).to.equal('1.23');
          expect(f(0.12345)).to.equal('0.123');

          f = formatter('####', ',', '.');

          expect(f(99.123)).to.equal('99.12');
          expect(f(0.1)).to.equal('0.1');

          f = formatter('#########', ',', '.');

          expect(f(0.100500)).to.equal('0.1005');
          expect(f(1.2345)).to.equal('1.2345');

          f = formatter('##########', ',', '.');

          expect(f(0.000001)).to.equal('1e-6');
          expect(f(0.00000123)).to.equal('1.23e-6');

          f = formatter('#-###', '-');

          expect(f(1234567, '-')).to.equal('1.235e+6');

          f = formatter('##,###', ',', '.');

          expect(f(1234.5)).to.equal('1,234.5');

          f = formatter('###,###', ',', '.');

          expect(f(1000000)).to.equal('1e+6');

          f = formatter('#0', ',', '.');

          expect(f(155)).to.equal('155');
        });

        it('should support negative numbers', () => {
          f = formatter('#.##', ',', '.');

          expect(f(-1)).to.equal('-1');
          expect(f(-0.1234)).to.equal('-0.12');
        });

        it('should support arbitrary grouping separator', () => {
          f = formatter('#,##0', ',');

          expect(f(123456789)).to.equal('123,456,789');

          f = formatter('0', '');

          expect(f(123456789)).to.equal('123456789');

          f = formatter('#abc##0', 'abc');

          expect(f(123456789)).to.equal('123abc456abc789');

          f = formatter('#abc###,0', 'abc', ',');

          expect(f(123456789)).to.equal('123abc456abc789,0');

          f = formatter('#,.?+[{})(##0', ',.?+[{})(');

          expect(f(123456789)).to.equal('123,.?+[{})(456,.?+[{})(789');
        });

        it('should support arbitrary decimal separator', () => {
          f = formatter('#.##', ',', '.');

          expect(f(1.23)).to.equal('1.23');

          f = formatter('#,##', ' ', ',');

          expect(f(1.23)).to.equal('1,23');

          f = formatter('#abc##', '', 'abc');

          expect(f(1.23)).to.equal('1abc23');

          f = formatter('#,.?+[{})##', ' ', ',.?+[{})');

          expect(f(1.23)).to.equal('1,.?+[{})23');
        });

        it('should support arbitrary mix of grouping and decimal separators', () => {
          f = formatter('# ###.###', ' ', '.');

          expect(f(123456789.987)).to.equal('123 456 789.987');

          f = formatter('#.###,###', '.', ',');

          expect(f(123456789.987)).to.equal('123.456.789,987');

          f = formatter("#'###?###", "'", '?');

          expect(f(123456789.987)).to.equal("123'456'789?987");

          f = formatter('#-###,###', '-', ',');

          expect(f(123456789.987)).to.equal('123-456-789,987');

          f = formatter('##0--000', '', '--');

          expect(f(12345.987)).to.equal('12345--987');

          f = formatter('### 00', '', ' ');

          expect(f(123456789.987)).to.equal('123456789 99');

          f = formatter('#,.?+[{})###,.?+[{}(###', ',.?+[{})', ',.?+[{}(');

          expect(f(123456789.987)).to.equal('123,.?+[{})456,.?+[{})789,.?+[{}(987');
        });

        it('should ignore grouping if grouping separator is same as decimal separator', () => {
          f = formatter('#.###.###', '.', '.');

          expect(f(123456789.987)).to.equal('123456789.987');

          f = formatter('#,.?+[{})###,.?+[{})###', ',.?+[{})', ',.?+[{})');

          expect(f(123456789.987)).to.equal('123456789,.?+[{})987');
        });

        it('should format integers', () => {
          f = formatter('0');

          expect(f(0)).to.equal('0');
          expect(f(1)).to.equal('1');
          expect(f(100)).to.equal('100');
          expect(f(1000)).to.equal('1000');
          expect(f(100000)).to.equal('100000');

          f = formatter('0000');

          expect(f(0)).to.equal('0000');
          expect(f(1)).to.equal('0001');
          expect(f(100)).to.equal('0100');
        });

        it('should format decimals', () => {
          f = formatter('#.00');

          expect(f(0.1234)).to.equal('0.12');
          expect(f(1.5678)).to.equal('1.57');
          expect(f(1.995)).to.equal('2.00');
          expect(f(100.2)).to.equal('100.20');
          expect(f(1000)).to.equal('1000.00');
          expect(f(100000)).to.equal('100000.00');

          f = formatter('#.0');

          expect(f(0.1234)).to.equal('0.1');
          expect(f(1.5678)).to.equal('1.6');
          expect(f(1.955)).to.equal('2.0');
          expect(f(17.957601273148124)).to.equal('18.0');
          expect(f(100.2)).to.equal('100.2');
          expect(f(1000)).to.equal('1000.0');
          expect(f(100000)).to.equal('100000.0');

          f = formatter('#.0##');

          expect(f(0)).to.equal('0.0');
          expect(f(1.5678)).to.equal('1.568');
          expect(f(100.2)).to.equal('100.2');
        });

        it('should support grouping', () => {
          f = formatter('#,###.00', ',', '.');

          expect(f(0)).to.equal('0.00');
          expect(f(1)).to.equal('1.00');
          expect(f(100)).to.equal('100.00');
          expect(f(1000)).to.equal('1,000.00');
          expect(f(100000)).to.equal('100,000.00');
          expect(f(10000000)).to.equal('10,000,000.00');

          f = formatter('####-###0', '-');

          expect(f(123456789876543)).to.equal('123-4567-8987-6543');

          f = formatter('####-###0', '-');

          expect(f(123456789)).to.equal('1-2345-6789');
        });

        it('should support SI abbreviations', () => {
          f = formatter('#,###.0A', ',');

          expect(f(0)).to.equal('0.0');
          expect(f(1)).to.equal('1.0');
          expect(f(100)).to.equal('100.0');
          expect(f(1000)).to.equal('1.0k');
          expect(f(100000)).to.equal('100.0k');
          expect(f(10000000)).to.equal('10.0M');

          f = formatter('#.###A');

          expect(f(1234567, '#.###A')).to.equal('1.235M');

          f = formatter('#.#A');

          expect(f(0.0001)).to.equal('0.1m');
        });

        it('should support percentage', () => {
          f = formatter('0.0%');

          expect(f(0)).to.equal('0.0%');
          expect(f(0.275)).to.equal('27.5%');
          expect(f(0.17957601273148124)).to.equal('18.0%');
          expect(f(1)).to.equal('100.0%');

          f = formatter('%');

          expect(f(0)).to.equal('%0');
          expect(f(0.275)).to.equal('%3e+1');
          expect(f(1)).to.equal('%1e+2');
        });

        it('should support text surrounding the pattern', () => {
          f = formatter('foo0.0bar');

          expect(f(1.234)).to.equal('foo1.2bar');

          f = formatter('$(#,##0)');

          expect(f(123456789)).to.equal('$(123,456,789)');
          expect(f(-123456789)).to.equal('$(-123,456,789)');

          f = formatter('$(#,###.00)%');

          expect(f(0.23456)).to.equal('$(23.46)%');
        });

        it('should support positive and negative formatting', () => {
          f = formatter('0.0;(0.0)');

          expect(f(1.234)).to.equal('1.2');
          expect(f(-1.234)).to.equal('(1.2)');
        });

        it('should support zero formatting', () => {
          f = formatter('0.0;(0.0);zero');
          expect(f(0)).to.equal('zero');
        });

        it.skip('should use list separator from locale info', () => {
          f = formatter('0.0|(0.0)|zero', '', '', '', {
            qListSep: '|'
          });
          expect(f(1)).to.equal('1.0');
          expect(f(-2)).to.equal('(2.0)');
          expect(f(0)).to.equal('zero');
        });

        it('should support hexadecimal formatting', () => {
          f = formatter('(hex)');

          expect(f(0)).to.equal('0');
          expect(f(1)).to.equal('1');
          expect(f(10)).to.equal('a');
          expect(f(199)).to.equal('c7');
          expect(f(16)).to.equal('10');
          expect(f(-10)).to.equal('-a');

          f = formatter('(HEX)');

          expect(f(15)).to.equal('F');
          expect(f(199)).to.equal('C7');
        });

        it('should support octal formatting', () => {
          f = formatter('(oct)');

          expect(f(0)).to.equal('0');
          expect(f(1)).to.equal('1');
          expect(f(10)).to.equal('12');
          expect(f(20)).to.equal('24');
          expect(f(199)).to.equal('307');
        });

        it('should support binary formatting', () => {
          f = formatter('(bin)');

          expect(f(0)).to.equal('0');
          expect(f(1)).to.equal('1');
          expect(f(10)).to.equal('1010');
          expect(f(15.15)).to.equal('1111.0010011001');
          expect(f(199)).to.equal('11000111');
        });

        it('should support arbitrary base/radix', () => {
          f = formatter('(r04)');

          expect(f(0)).to.equal('0');
          expect(f(1)).to.equal('1');
          expect(f(6)).to.equal('12');
          expect(f(20)).to.equal('110');
        });

        it('should not format if radix is less than 2 or larger than 36', () => {
          f = formatter('(r60)');

          expect(f(1.123)).to.equal('(r61)'); // the pattern (r60) will be interpreted as prefix '(r6', pattern '0' followed by postfix ')'

          f = formatter('(r61)');

          expect(f(1.123)).to.equal('(r61)1');
          expect(f(0.123)).to.equal('(r61)0.1');
          expect(f(123)).to.equal('(r61)1e+2');
        });

        it('should support roman numerals and format integers', () => {
          f = formatter('(ROM)');

          expect(f(0)).to.equal('0');
          expect(f(1)).to.equal('I');
          expect(f(2)).to.equal('II');
          expect(f(3)).to.equal('III');
          expect(f(4)).to.equal('IV');
          expect(f(5)).to.equal('V');
          expect(f(6)).to.equal('VI');
          expect(f(9)).to.equal('IX');
          expect(f(10)).to.equal('X');
          expect(f(40)).to.equal('XL');
          expect(f(45)).to.equal('XLV');
          expect(f(90)).to.equal('XC');
          expect(f(100)).to.equal('C');
          expect(f(400)).to.equal('CD');
          expect(f(500)).to.equal('D');
          expect(f(900)).to.equal('CM');
          expect(f(999)).to.equal('CMXCIX');
          expect(f(1000)).to.equal('M');
          expect(f(3999)).to.equal('MMMCMXCIX');
          expect(f(4000)).to.equal('MMMM');
        });

        it('should support roman numerals and ignore decimals', () => {
          f = formatter('(ROM)');

          expect(f(0.12345)).to.equal('0');
          expect(f(1.2345)).to.equal('I');
          expect(f(1.987)).to.equal('I');
          expect(f(999.987)).to.equal('CMXCIX');
        });

        it('should support roman numerals and handle negative values', () => {
          f = formatter('(ROM)');

          expect(f(-0.12345)).to.equal('0');
          expect(f(-1.2345)).to.equal('-I');
          expect(f(-1.987)).to.equal('-I');
          expect(f(-9.6)).to.equal('-IX');
          expect(f(-9.4)).to.equal('-IX');
          expect(f(-999.987)).to.equal('-CMXCIX');
        });

        it('should support roman numerals and return the same format as engine when value > 500000', () => {
          f = formatter('(ROM)');

          expect(f(500001)).to.equal('(ROM)5e+5');
          expect(f(-99999999)).to.equal('(ROM)-1e+8');
        });

        it('should support roman numerals and return lowercase letters when lowercase pattern is used', () => {
          f = formatter('(rom)');

          expect(f(1959)).to.equal('mcmlix');
          expect(f(50)).to.equal('l');
        });

        it('should support coercible values', () => {
          f = formatter('$0.0');
          expect(f('')).to.equal('$0.0');
          expect(f(true)).to.equal('$1.0');
          expect(f(false)).to.equal('$0.0');
          expect(f(undefined)).to.equal('undefined');
          expect(f(null)).to.equal('$0.0');
        });

        describe('format', () => {
          it('should use the passed arguments instead of the ones passed at construction', () => {
            f = formatter('0');

            expect(f.format('###0', 1.5e+24, '', ',')).to.equal('1,5e+24');
            expect(f.format('##', 0.12345, ',', '.')).to.equal('0.12');
            expect(f.format('###', 1.2345, ',', '.')).to.equal('1.23');
            expect(f.format('#.###,###', 123456789.987, '.', ',')).to.equal('123.456.789,987');
            expect(f.format('#.00', 0.1234)).to.equal('0.12');
            expect(f.format('#,###.00', 10000000, ',', '.')).to.equal('10,000,000.00');
            expect(f.format('#,###.0A', 1000, ',')).to.equal('1.0k');
            expect(f.format('0.0%', 0.275)).to.equal('27.5%');
            expect(f.format('foo0.0bar', 1.234)).to.equal('foo1.2bar');
            expect(f.format('0.0;(0.0)', 1.234)).to.equal('1.2');
            expect(f.format('0.0;(0.0)', -1.234)).to.equal('(1.2)');
            expect(f.format('(hex)', 199)).to.equal('c7');
            expect(f.format('(oct)', 10, '', '')).to.equal('12');
            expect(f.format('(bin)', 10, '', '')).to.equal('1010');
            expect(f.format('(ROM)', 40)).to.equal('XL');
          });
        });

        describe('pattern', () => {
          it('should return the current pattern when no argument passed', () => {
            f = formatter('0');

            expect(f.pattern()).to.equal('0');
          });

          it('should change the pattern of the existing formatter when argument passed', () => {
            f = formatter('(oct)');

            expect(f(10)).to.equal('12');

            f.pattern('(bin)');

            expect(f.pattern()).to.equal('(bin)');

            expect(f(10)).to.equal('1010');
          });
        });
      });
    });

    describe('without arguments specified at construction', () => {
      beforeEach(() => {
        f = formatter();
      });

      describe('format', () => {
        it('should not format numbers', () => {
          expect(f(0)).to.equal('0');
          expect(f(0.123456789)).to.equal('0.123456789');
          expect(f(-5000)).to.equal('-5000');
        });

        it('should handle NaNs correctly', () => {
          expect(isNaN(f(NaN))).to.equal(true);
          expect(f('NaN')).to.equal('NaN');
        });

        it('should not format non-numerics', () => {
          expect(f('$3.2')).to.equal('$3.2');
          expect(f('Hello World')).to.equal('Hello World');
        });

        describe('format', () => {
          it('should use the passed arguments instead of the ones passed at construction', () => {
            expect(f.format('###0', 1.5e+24, '', ',')).to.equal('1,5e+24');
            expect(f.format('##', 0.12345, ',', '.')).to.equal('0.12');
            expect(f.format('###', 1.2345, ',', '.')).to.equal('1.23');
            expect(f.format('#.###,###', 123456789.987, '.', ',')).to.equal('123.456.789,987');
            expect(f.format('#.00', 0.1234)).to.equal('0.12');
            expect(f.format('#,###.00', 10000000, ',', '.')).to.equal('10,000,000.00');
            expect(f.format('#,###.0A', 1000, ',')).to.equal('1.0k');
            expect(f.format('0.0%', 0.275)).to.equal('27.5%');
            expect(f.format('foo0.0bar', 1.234)).to.equal('foo1.2bar');
            expect(f.format('0.0;(0.0)', 1.234)).to.equal('1.2');
            expect(f.format('0.0;(0.0)', -1.234)).to.equal('(1.2)');
            expect(f.format('(hex)', 199)).to.equal('c7');
            expect(f.format('(oct)', 10, '', '')).to.equal('12');
            expect(f.format('(bin)', 10, '', '')).to.equal('1010');
            expect(f.format('(ROM)', 40)).to.equal('XL');
          });
        });

        describe('pattern', () => {
          it('should return the current pattern when no argument passed', () => {
            expect(f.pattern()).to.equal(undefined);
          });

          it('should change the pattern of the existing formatter when argument passed', () => {
            expect(f(10)).to.equal('10');

            f.pattern('(bin)');

            expect(f.pattern()).to.equal('(bin)');

            expect(f(10)).to.equal('1010');
          });
        });
      });
    });
  });
});
