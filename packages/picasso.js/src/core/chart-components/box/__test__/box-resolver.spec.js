import complexResolver from '../box-resolver';
import settingsResolver from '../../../scales/settings-resolver';

describe('box resolver', () => {
  describe('complexResolver', () => {
    it('should resolve compelex settings objects correctly', () => {
      const resolver = settingsResolver({
        chart: {
          scale: () => {}
        }
      });

      let defaultSettings = {
        box: {
          fill: 'white',
          stroke: 'black',
          strokeWidth: 1
        },
        line: {
          strokeWidth: 3
        }
      };

      let style = {
        box: {
          stroke: 'orange'
        }
      };

      let settings = {
        box: {
          fill: () => 'green',
          dataBoundColor: function dataBoundColor(b) {
            return `dark${b.datum.dataBoundColor}`;
          }
        }
      };

      const width = 200;
      const height = 200;

      const results = complexResolver({
        keys: ['box', 'line'],
        data: {
          items: [
            { dataBoundColor: 'yellow' }
          ]
        },
        defaultSettings,
        style,
        settings,
        width,
        height,
        resolver
      });

      expect(results.major.items).to.be.an('array');
      expect(results.major.items.length).to.be.equal(1);
      expect(results.box.items[0]).to.eql({
        fill: 'green',
        stroke: 'orange',
        strokeWidth: 1,
        dataBoundColor: 'darkyellow',
        data: { dataBoundColor: 'yellow' }
      });

      expect(results.line.items[0]).to.eql({
        strokeWidth: 3,
        data: { dataBoundColor: 'yellow' }
      });
    });
  });
});
