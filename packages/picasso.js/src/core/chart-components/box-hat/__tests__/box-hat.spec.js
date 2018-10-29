import { hat, buildShapes } from '../box-hat';

describe('box hat component', () => {
  describe('hat shape function', () => {
    let item;
    let boxWidth;
    let boxPadding;
    let rendWidth;
    let rendHeight;

    beforeEach(() => {
      item = {
        major: 0.5,
        hat: {
          someProp: true
        }
      };

      boxWidth = 1;
      boxPadding = 0;
      rendWidth = 150;
      rendHeight = 200;
    });

    it('should render a hat marker', () => {
      const result = hat({
        item, boxWidth, boxPadding, rendWidth, rendHeight, flipXY: false
      });

      expect(result).to.be.an('array');
      expect(result[0]).to.be.eql({
        d: 'M75 200 L75 8 L225 200 L225 210 L75 210 Z',
        someProp: true,
        type: 'path'
      });
      expect(result[1]).to.be.eql({
        d: 'M75 0 L225 192 L225 0 L225 -10 L75 -10 Z',
        someProp: true,
        type: 'path'
      });
    });

    it('should render a hat marker with flipXY', () => {
      const result = hat({
        item, boxWidth, boxPadding, rendWidth, rendHeight, flipXY: true
      });

      expect(result).to.be.an('array');
      expect(result[0]).to.be.eql({
        d: 'M150 100 L8 300 L150 300 L160 300 L160 100 Z',
        someProp: true,
        type: 'path'
      });
      expect(result[1]).to.be.eql({
        d: 'M0 100 L142 100 L0 300 L-10 300 L-10 100 Z',
        someProp: true,
        type: 'path'
      });
    });
  });

  describe('buildShapes function', () => {
    let item;
    let calcRenderingOpts;
    let resolved;

    beforeEach(() => {
      item = {
        major: 0.5,
        start: -1,
        end: 0.5,
        hat: {
          someProp: true,
          location: 'above'
        }
      };

      resolved = {
        major: {
          items: [item]
        }
      };

      calcRenderingOpts = () => ({
        item,
        boxWidth: 1,
        boxPadding: 0,
        rendWidth: 150,
        rendHeight: 200,
        isOutOfBounds: false
      });
    });

    it('should render above', () => {
      const result = buildShapes({
        width: 150,
        height: 200,
        flipXY: false,
        resolved,
        _calcItemRenderingOpts: calcRenderingOpts
      });

      expect(result).to.be.an('array');
      expect(result[0]).to.be.a('object');
      expect(result[0].children).to.be.an('array');
      expect(result[0].children).to.containSubset([{
        type: 'path',
        someProp: true
      }]);
    });

    it('should not render below', () => {
      item.hat.location = 'below';

      const result = buildShapes({
        width: 150,
        height: 200,
        flipXY: false,
        resolved,
        _calcItemRenderingOpts: calcRenderingOpts
      });

      expect(result).to.be.an('array');
      expect(result[0]).to.be.a('object');
      expect(result[0].children).to.be.an('array');
      expect(result[0].children).to.be.eql([]);
    });

    it('should not render above when flipXY', () => {
      const result = buildShapes({
        width: 150,
        height: 200,
        flipXY: true,
        resolved,
        _calcItemRenderingOpts: calcRenderingOpts
      });

      expect(result).to.be.an('array');
      expect(result[0]).to.be.a('object');
      expect(result[0].children).to.be.an('array');
      expect(result[0].children).to.be.eql([]);
    });

    it('should render below when flipXY', () => {
      item.hat.location = 'below';

      const result = buildShapes({
        width: 150,
        height: 200,
        flipXY: true,
        resolved,
        _calcItemRenderingOpts: calcRenderingOpts
      });

      expect(result).to.be.an('array');
      expect(result[0]).to.be.a('object');
      expect(result[0].children).to.be.an('array');
      expect(result[0].children).to.containSubset([{
        type: 'path',
        someProp: true
      }]);
    });

    it('should not render when outOfBounds', () => {
      item.hat.location = 'below';

      calcRenderingOpts = () => ({
        item,
        boxWidth: 1,
        boxPadding: 0,
        rendWidth: 150,
        rendHeight: 200,
        isOutOfBounds: true
      });

      const result = buildShapes({
        width: 150,
        height: 200,
        flipXY: true,
        resolved,
        _calcItemRenderingOpts: calcRenderingOpts
      });

      expect(result).to.be.an('array');
      expect(result[0]).to.be.a('object');
      expect(result[0].children).to.be.an('array');
      expect(result[0].children).to.be.eql([]);
    });
  });
});
