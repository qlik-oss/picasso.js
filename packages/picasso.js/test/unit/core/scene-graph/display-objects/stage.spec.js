import { create } from '../../../../../src/core/scene-graph/display-objects/stage';
import { create as createRect } from '../../../../../src/core/scene-graph/display-objects/rect';
import { create as createContainer } from '../../../../../src/core/scene-graph/display-objects/container';

describe('Stage', () => {
  let stage;
  let children;

  beforeEach(() => {
    stage = create();
    children = [];
    children.push(createRect({ x: 0, y: 0, width: 100, height: 100, fill: 'rect1' })); // Add fill value to have a point of validation
    children.push(createRect({ x: 50, y: 50, width: 100, height: 100, fill: 'rect2' }));
    children.push(createRect({ x: 500, y: 500, width: 100, height: 100, fill: 'rect3' }));
    stage.addChildren(children);
  });

  describe('getItemsFrom', () => {
    describe('Point', () => {
      it('should handle a call when there are no children', () => {
        stage = create();
        const r = stage.getItemsFrom({ x: 60, y: 60 });

        expect(r).to.be.empty;
      });

      it('should return an empty array when there are no hits', () => {
        const r = stage.getItemsFrom({ x: 6000, y: 6000 });

        expect(r).to.be.empty;
      });

      it('should return child objects that intersect with a point', () => {
        const r = stage.getItemsFrom({ x: 60, y: 60 });

        expect(r.map(rr => rr.node.attrs.fill)).to.deep.equal(['rect1', 'rect2']);
      });

      it('should travese child objects children and return objects that intersect with a point', () => {
        const container = createContainer();
        container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100, fill: 'containerRect1' }));
        container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200, fill: 'containerRect2' }));
        stage.addChild(container);

        const r = stage.getItemsFrom({ x: 550, y: 550 });

        expect(r.map(rr => rr.node.attrs.fill)).to.deep.equal(['rect3', 'containerRect1', 'containerRect2']);
      });

      it('should transform the input point based on the dpi ratio', () => {
        stage = create(2);
        stage.addChild(createRect({ x: 50, y: 50, width: 100, height: 100, fill: 'hit' }));
        stage.addChild(createRect({ x: 20, y: 20, width: 20, height: 20, fill: 'miss' }));
        const r = stage.getItemsFrom({ x: 30, y: 30 });

        expect(r.map(rr => rr.node.attrs.fill)).to.deep.equal(['hit']);
        expect(r.length).to.equal(1);
      });
    });

    describe('Line', () => {
      it('should handle a call when there are no children', () => {
        stage = create();
        const r = stage.getItemsFrom({ x1: 60, y1: 60, x2: 120, y2: 120 });

        expect(r).to.be.empty;
      });

      it('should return an empty array when there are no hits', () => {
        const r = stage.getItemsFrom({ x1: 6000, y1: 6000, x2: 12000, y2: 12000 });

        expect(r).to.be.empty;
      });

      it('should return child objects that intersect with a line', () => {
        const r = stage.getItemsFrom({ x1: 60, y1: 60, x2: 120, y2: 120 });

        expect(r.map(rr => rr.node.attrs.fill)).to.deep.equal(['rect1', 'rect2']);
      });

      it('should transform the input line based on the dpi ratio', () => {
        stage = create(2);
        stage.addChild(createRect({ x: 50, y: 50, width: 100, height: 100, fill: 'hit' }));
        stage.addChild(createRect({ x: 20, y: 20, width: 20, height: 20, fill: 'miss' }));

        const r = stage.getItemsFrom({ x1: 30, y1: 0, x2: 30, y2: 30 });

        expect(r[0].node.attrs.fill).to.equal('hit');
        expect(r.length).to.equal(1);
      });
    });

    describe('Rect', () => {
      it('should handle a call when there are no children', () => {
        stage = create();
        const r = stage.getItemsFrom({ x: 60, y: 60, width: 120, height: 120 });

        expect(r).to.be.empty;
      });

      it('should return an empty array when there are no hits', () => {
        const r = stage.getItemsFrom({ x: 6000, y: 6000, width: 120, height: 120 });

        expect(r).to.be.empty;
      });

      it('should return child objects that intersect with a rect', () => {
        const r = stage.getItemsFrom({ x: 60, y: 60, width: 120, height: 120 });

        expect(r.map(rr => rr.node.attrs.fill)).to.deep.equal(['rect1', 'rect2']);
      });

      it('should transform the input line based on the dpi ratio', () => {
        stage = create(2);
        stage.addChild(createRect({ x: 50, y: 50, width: 100, height: 100, fill: 'hit' }));
        stage.addChild(createRect({ x: 20, y: 20, width: 20, height: 20, fill: 'miss' }));

        const r = stage.getItemsFrom({ x: 30, y: 0, width: 30, height: 30 });

        expect(r[0].node.attrs.fill).to.equal('hit');
        expect(r.length).to.equal(1);
      });
    });
  });
});
