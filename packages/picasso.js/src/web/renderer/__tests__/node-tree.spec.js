import {
  diff, createNodes, destroyNodes, updateNodes
} from '../node-tree';

function getContent(arr) {
  return arr.map(a => a.content);
}

describe('node-tree', () => {
  describe('createNodes', () => {
    it('should call factory function with type and parent params', () => {
      let fn = sinon.spy(),
        p = {},
        nodes = [{ content: { type: 'a' } }, { content: { type: 'b' } }];
      createNodes(nodes, p, fn);
      expect(fn.firstCall).to.have.been.calledWithExactly('a', p);
      expect(fn.secondCall).to.have.been.calledWithExactly('b', p);
    });

    it('should store created objects', () => {
      let fn = s => `step ${s}`,
        p = {},
        nodes = [{ content: { type: '1' } }, { content: { type: '2' } }];

      createNodes(nodes, p, fn);
      expect(nodes[0].object).to.equal('step 1');
      expect(nodes[1].object).to.equal('step 2');
    });
  });

  describe('destroyNodes', () => {
    it('should call factory function with object instance', () => {
      let fn = sinon.spy(),
        nodes = [{ object: 'a' }, { object: 'b' }, {}, { object: null }];
      destroyNodes(nodes, fn);
      expect(fn.callCount).to.equal(2);
      expect(fn.firstCall).to.have.been.calledWithExactly('a');
      expect(fn.secondCall).to.have.been.calledWithExactly('b');
    });

    it('should nullify node object', () => {
      let fn = () => {},
        nodes = [{ object: 'a' }, { object: 'b' }];
      destroyNodes(nodes, fn);
      expect(nodes).to.deep.equal([{ object: null }, { object: null }]);
    });
  });

  describe('updateNodes', () => {
    it('should call maintainer function with object instance and content', () => {
      let fn = sinon.spy(),
        nodes = [{ object: 'a', content: 'foo' }, { object: 'b', content: false }, {}, { object: null }];
      updateNodes(nodes, null, fn);
      expect(fn.callCount).to.equal(2);
      expect(fn.firstCall).to.have.been.calledWithExactly('a', 'foo');
      expect(fn.secondCall).to.have.been.calledWithExactly('b', false);
    });
  });

  describe('diff', () => {
    describe('by value', () => {
      describe('added', () => {
        it('should contain added items when arrays are different', () => {
          const added = getContent(diff([1, 4], [5, 1, 3]).added);
          expect(added).to.deep.equal([5, 3]);
        });
        it('should be empty when arrays contain same values', () => {
          const added = getContent(diff([1, 2], [2, 1]).added);
          expect(added).to.deep.equal([]);
        });

        it('should contain added items when arrays are different', () => {
          const added = getContent(diff([1, 4], [5, 0, 3]).added);
          expect(added).to.deep.equal([5, 0, 3]);
        });
      });

      describe('updated', () => {
        it("should be empty when values don't match", () => {
          const updated = getContent(diff([], [1, 2, 3]).updatedNew);
          expect(updated).to.deep.equal([]);
        });
        it('should contain updated items when same values exist in both arrays', () => {
          const updated = getContent(diff([1, 2, 5, 3], [4, 3, 2]).updatedNew);
          expect(updated).to.deep.equal([3, 2]);
        });
      });

      describe('removed', () => {
        it('should be empty when new array contains old values', () => {
          const removed = getContent(diff([1, 'foo'], ['foo', 7, 1]).removed);
          expect(removed).to.deep.equal([]);
        });
        it('should contain removed items when new array does not contain old values', () => {
          const removed = getContent(diff(['a', 1, 3], [1]).removed);
          expect(removed).to.deep.equal(['a', 3]);
        });
      });
    });

    describe('by id', () => {
      describe('added', () => {
        it('should contain new items', () => {
          const added = getContent(diff([{ id: 4 }], [{ id: 1 }, { id: 4 }, { id: 3 }]).added);
          expect(added).to.deep.equal([{ id: 1 }, { id: 3 }]);
        });
        it('should be empty when new items are not added', () => {
          const added = getContent(diff([{ id: 1 }, { id: 2 }], [{ id: 2 }]).added);
          expect(added).to.deep.equal([]);
        });
      });

      describe('updated', () => {
        it('should be empty when items are unique', () => {
          const updated = getContent(diff([{ id: 1 }], [{ id: 2 }, { id: 0 }]).updatedNew);
          expect(updated).to.deep.equal([]);
        });
        it('should contain shared items', () => {
          const updated = getContent(diff([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 5 }]).updatedNew);
          expect(updated).to.deep.equal([{ id: 2 }]);
        });
      });

      describe('removed', () => {
        it('should be empty when old items are not removed', () => {
          const removed = getContent(diff([{ id: 1 }], [{ id: 1 }, { id: 2 }, { id: 3 }]).removed);
          expect(removed).to.deep.equal([]);
        });
        it('should contain removed items', () => {
          const removed = getContent(diff([{ id: 1 }, { id: 2 }, { id: 3 }], [{ id: 3 }]).removed);
          expect(removed).to.deep.equal([{ id: 1 }, { id: 2 }]);
        });
      });
    });
  });
});
