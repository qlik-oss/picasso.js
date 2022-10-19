import * as ellipsText from '../../../../text-manipulation/text-ellipsis';
import render from '../text';

describe('text', () => {
  describe('render', () => {
    let sandbox, g, falsys, truthys, text;

    beforeEach(() => {
      sandbox = sinon.createSandbox();

      g = {
        beginPath: sandbox.spy(),
        font: '',
        textAlign: '',
        textBaseline: '',
        fillText: sandbox.spy(),
        strokeText: sandbox.spy(),
        canvas: {},
      };

      sandbox.stub(ellipsText, 'default').callsFake(() => '...');

      falsys = [false, null, undefined, 0, NaN, ''];

      truthys = [true, {}, [], 1, -1, 3.14, -3.14, 'foo'];

      text = {
        x: 1,
        y: 2,
        dx: 3,
        dy: 4,
        'font-size': '15px',
        'font-family': 'sans',
        'font-weight': 'normal',
        stroke: 'transparent',
        strokeWidth: 0,
        'text-anchor': '',
        'dominant-baseline': '',
      };
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should set font correctly', () => {
      render(text, { g });

      expect(g.font).to.equal('normal 15px sans');
    });

    it('should set defined fontWeight', () => {
      text['font-weight'] = 'bold';
      render(text, { g });

      expect(g.font).to.equal('bold 15px sans');
    });

    it('should not fire stroke if stroke condition is falsy', () => {
      falsys.forEach((value) => {
        render(text, { g, doStroke: value });

        expect(g.strokeText.called).to.equal(false);
      });
    });

    it('should fire stroke if stroke condition is truthy', () => {
      truthys.forEach((value) => {
        g.strokeText.resetHistory();

        render(text, { g, doStroke: value });

        expect(g.strokeText.calledOnce).to.equal(true);
      });
    });

    describe('textAlign', () => {
      const cases = [
        { value: 'left', expected: 'left' },
        { value: 'right', expected: 'right' },
        { value: 'center', expected: 'center' },
        { value: 'start', expected: 'start' },
        { value: 'end', expected: 'end' },
        { value: 'middle', expected: 'center' },
        { value: 'inherit', expected: 'inherit' },
      ];

      cases.forEach((fixture) => {
        it(`should be set correctly when text-anchor is ${fixture.value}`, () => {
          text['text-anchor'] = fixture.value;

          render(text, { g });

          expect(g.textAlign).to.equal(fixture.expected);
        });
      });
    });

    describe('baseline', () => {
      it('should transform dominant-baseline into a dy value', () => {
        text['dominant-baseline'] = 'ideographic';
        text['font-size'] = '10px';
        render(text, { g });

        expect(g.fillText.args[0][2]).to.equal(2 + 4 - 2); // Validate y params
      });
    });
  });
});
