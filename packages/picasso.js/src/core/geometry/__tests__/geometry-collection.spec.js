import GeometryCollection from '../geometry-collection';

describe('GeometryCollection', () => {
  let c;

  describe('Constructor', () => {
    it('should set correct default values', () => {
      c = new GeometryCollection();
      expect(c.geometries).to.be.empty;
    });

    it('should accept an array of geometries', () => {
      c = new GeometryCollection([
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: 10,
          height: 10,
        },
        {
          type: 'circle',
          cx: 0,
          cy: 0,
          r: 10,
        },
      ]);
      expect(c.geometries).to.be.of.length(2);
    });
  });

  describe('Set', () => {
    it('should accept an array of geometries', () => {
      c = new GeometryCollection();
      c.set([
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: 10,
          height: 10,
        },
        {
          type: 'circle',
          cx: 0,
          cy: 0,
          r: 10,
        },
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
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: 10,
          height: 10,
        },
        {
          type: 'circle',
          cx: 100,
          cy: 100,
          r: 10,
        },
        {
          type: 'circle',
          cx: 0,
          cy: 0,
          r: 10,
        },
      ]);
    });

    it('containsPoint - should call geometries until match is found', () => {
      stub0 = vi.spyOn(c.geometries[0], 'containsPoint').mockReturnValue(false);
      stub1 = vi.spyOn(c.geometries[1], 'containsPoint').mockReturnValue(true);
      stub2 = vi.spyOn(c.geometries[2], 'containsPoint').mockReturnValue(true);

      match = c.containsPoint(1);

      expect(stub0).toHaveBeenCalledWith(1);
      expect(stub1).toHaveBeenCalledWith(1);
      expect(stub2).not.toHaveBeenCalled();
      expect(match).to.be.true;
    });

    it('intersectsRect - should call geometries until match is found', () => {
      stub0 = vi.spyOn(c.geometries[0], 'intersectsRect').mockReturnValue(false);
      stub1 = vi.spyOn(c.geometries[1], 'intersectsRect').mockReturnValue(true);
      stub2 = vi.spyOn(c.geometries[2], 'intersectsRect').mockReturnValue(true);

      match = c.intersectsRect(1);

      expect(stub0).toHaveBeenCalledWith(1);
      expect(stub1).toHaveBeenCalledWith(1);
      expect(stub2).not.toHaveBeenCalled();
      expect(match).to.be.true;
    });

    it('intersectsLine - should call geometries until match is found', () => {
      stub0 = vi.spyOn(c.geometries[0], 'intersectsLine').mockReturnValue(false);
      stub1 = vi.spyOn(c.geometries[1], 'intersectsLine').mockReturnValue(true);
      stub2 = vi.spyOn(c.geometries[2], 'intersectsLine').mockReturnValue(true);

      match = c.intersectsLine(1);

      expect(stub0).toHaveBeenCalledWith(1);
      expect(stub1).toHaveBeenCalledWith(1);
      expect(stub2).not.toHaveBeenCalled();
      expect(match).to.be.true;
    });

    it('intersectsCircle - should call geometries until match is found', () => {
      stub0 = vi.spyOn(c.geometries[0], 'intersectsCircle').mockReturnValue(false);
      stub1 = vi.spyOn(c.geometries[1], 'intersectsCircle').mockReturnValue(true);
      stub2 = vi.spyOn(c.geometries[2], 'intersectsCircle').mockReturnValue(true);

      match = c.intersectsCircle(1);

      expect(stub0).toHaveBeenCalledWith(1);
      expect(stub1).toHaveBeenCalledWith(1);
      expect(stub2).not.toHaveBeenCalled();
      expect(match).to.be.true;
    });

    it('intersectsPolygon - should call geometries until match is found', () => {
      stub0 = vi.spyOn(c.geometries[0], 'intersectsPolygon').mockReturnValue(false);
      stub1 = vi.spyOn(c.geometries[1], 'intersectsPolygon').mockReturnValue(true);
      stub2 = vi.spyOn(c.geometries[2], 'intersectsPolygon').mockReturnValue(true);

      match = c.intersectsPolygon(1);

      expect(stub0).toHaveBeenCalledWith(1);
      expect(stub1).toHaveBeenCalledWith(1);
      expect(stub2).not.toHaveBeenCalled();
      expect(match).to.be.true;
    });
  });
});
