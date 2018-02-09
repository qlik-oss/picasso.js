import complexResolver from '../../../../../src/core/chart-components/box/box-resolver';
import settingsResolver from '../../../../../src/core/component/settings-resolver';

describe('box resolver', () => {
  describe('complexResolver', () => {
    it('should resolve compelex settings objects correctly', () => {
      const resolver = settingsResolver({
        resources: {
          chart: {
            scale: () => {}
          }
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
          dataBoundColor: function dataBoundColor() {
            return `dark${this.data.dataBoundColor}`;
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

      expect(results.items).to.be.an('array');
      expect(results.items.length).to.be.equal(1);
      expect(results.items[0]).to.be.eql({
        box: {
          fill: 'green',
          stroke: 'orange',
          strokeWidth: 1,
          dataBoundColor: 'darkyellow',
          data: { dataBoundColor: 'yellow' }
        },
        line: {
          strokeWidth: 3,
          data: { dataBoundColor: 'yellow' }
        },
        data: {
          dataBoundColor: 'yellow'
        }
      });
    });
  });
});
