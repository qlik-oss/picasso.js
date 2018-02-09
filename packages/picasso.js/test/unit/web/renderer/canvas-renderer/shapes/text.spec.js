import * as textManipulation from '../../../../../../src/web/text-manipulation';
import render from '../../../../../../src/web/renderer/canvas-renderer/shapes/text';

describe('text', () => {
  describe('render', () => {
    let sandbox,
      g,
      text;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();

      g = {
        beginPath: sandbox.spy(),
        font: '',
        textAlign: '',
        textBaseline: '',
        fillText: sandbox.spy(),
        canvas: {}
      };

      sandbox.stub(textManipulation, 'ellipsText').callsFake(() => '...');

      text = {
        x: 1,
        y: 2,
        dx: 3,
        dy: 4,
        'font-size': '15px',
        'font-family': 'sans',
        'text-anchor': '',
        'dominant-baseline': ''
      };
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should set font correctly', () => {
      render(text, { g });

      expect(g.font).to.equal('15px sans');
    });

    it('should fire ellipsText with correct arguments', () => {
      render(text, { g });

      expect(textManipulation.ellipsText.calledOnce).to.equal(true);
      expect(textManipulation.ellipsText.alwaysCalledWithExactly(text, textManipulation.measureText)).to.equal(true);
    });

    it('should fire fillText with correct arguments', () => {
      render(text, { g });

      expect(g.fillText.calledOnce).to.equal(true);
      expect(g.fillText.alwaysCalledWithExactly('...', 4, 6)).to.equal(true);
    });

    describe('textAlign', () => {
      const cases = [
        { value: 'left', expected: 'left' },
        { value: 'right', expected: 'right' },
        { value: 'center', expected: 'center' },
        { value: 'start', expected: 'start' },
        { value: 'end', expected: 'end' },
        { value: 'middle', expected: 'center' },
        { value: 'inherit', expected: 'inherit' }
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

        expect(g.fillText.args[0][2]).to.equal((2 + 4) - 2); // Validate y params
      });
    });
  });
});
