import GeometryCollection from '../../../../src/core/geometry/geometry-collection';

describe('GeometryCollection', () => {
  let c;

  describe('Constructor', () => {
    it('should set correct default values', () => {
      c = new GeometryCollection();
      expect(c.geometries).to.be.empty;
    });

    it('should accept an array of geometries', () => {
      c = new GeometryCollection([
        { type: 'rect', x: 0, y: 0, width: 10, height: 10 },
        { type: 'circle', cx: 0, cy: 0, r: 10 }
      ]);
      expect(c.geometries).to.be.of.length(2);
    });
  });

  describe('Set', () => {
    it('should accept an array of geometries', () => {
      c = new GeometryCollection();
      c.set([
        { type: 'rect', x: 0, y: 0, width: 10, height: 10 },
        { type: 'circle', cx: 0, cy: 0, r: 10 }
      ]);
      expect(c.geometries).to.be.of.length(2);
    });
  });

  describe('Intersection', () => {
    let stub0;
    let stub1;
    let stub2;
    let match;

    beforeEach(() => {
      c = new GeometryCollection([
        { type: 'rect', x: 0, y: 0, width: 10, height: 10 },
        { type: 'circle', cx: 100, cy: 100, r: 10 },
        { type: 'circle', cx: 0, cy: 0, r: 10 }
      ]);
    });

    it('containsPoint - should call geometries until match is found', () => {
      stub0 = sinon.stub(c.geometries[0], 'containsPoint').returns(false);
      stub1 = sinon.stub(c.geometries[1], 'containsPoint').returns(true);
      stub2 = sinon.stub(c.geometries[2], 'containsPoint').returns(true);

      match = c.containsPoint(1);

      expect(stub0).to.have.been.calledWithExactly(1);
      expect(stub1).to.have.been.calledWithExactly(1);
      expect(stub2).to.not.have.been.called;
      expect(match).to.be.true;
    });

    it('intersectsRect - should call geometries until match is found', () => {
      stub0 = sinon.stub(c.geometries[0], 'intersectsRect').returns(false);
      stub1 = sinon.stub(c.geometries[1], 'intersectsRect').returns(true);
      stub2 = sinon.stub(c.geometries[2], 'intersectsRect').returns(true);

      match = c.intersectsRect(1);

      expect(stub0).to.have.been.calledWithExactly(1);
      expect(stub1).to.have.been.calledWithExactly(1);
      expect(stub2).to.not.have.been.called;
      expect(match).to.be.true;
    });

    it('intersectsLine - should call geometries until match is found', () => {
      stub0 = sinon.stub(c.geometries[0], 'intersectsLine').returns(false);
      stub1 = sinon.stub(c.geometries[1], 'intersectsLine').returns(true);
      stub2 = sinon.stub(c.geometries[2], 'intersectsLine').returns(true);

      match = c.intersectsLine(1);

      expect(stub0).to.have.been.calledWithExactly(1);
      expect(stub1).to.have.been.calledWithExactly(1);
      expect(stub2).to.not.have.been.called;
      expect(match).to.be.true;
    });

    it('intersectsCircle - should call geometries until match is found', () => {
      stub0 = sinon.stub(c.geometries[0], 'intersectsCircle').returns(false);
      stub1 = sinon.stub(c.geometries[1], 'intersectsCircle').returns(true);
      stub2 = sinon.stub(c.geometries[2], 'intersectsCircle').returns(true);

      match = c.intersectsCircle(1);

      expect(stub0).to.have.been.calledWithExactly(1);
      expect(stub1).to.have.been.calledWithExactly(1);
      expect(stub2).to.not.have.been.called;
      expect(match).to.be.true;
    });

    it('intersectsPolygon - should call geometries until match is found', () => {
      stub0 = sinon.stub(c.geometries[0], 'intersectsPolygon').returns(false);
      stub1 = sinon.stub(c.geometries[1], 'intersectsPolygon').returns(true);
      stub2 = sinon.stub(c.geometries[2], 'intersectsPolygon').returns(true);

      match = c.intersectsPolygon(1);

      expect(stub0).to.have.been.calledWithExactly(1);
      expect(stub1).to.have.been.calledWithExactly(1);
      expect(stub2).to.not.have.been.called;
      expect(match).to.be.true;
    });
  });
});
