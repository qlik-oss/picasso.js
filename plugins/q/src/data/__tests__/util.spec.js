import { treeAccessor } from '../util';

describe('treeAccessor', () => {
  it('should return itself when depths are same', () => {
    let node = {
      text: 'A'
    };
    const a = treeAccessor(4, 4);
    expect(a(node)).to.eql(node);
  });

  it('should return ancestor when targetDepth is shallower than sourceDepth', () => {
    let node = {
      parent: {
        parent: {
          text: 'ancestor'
        }
      }
    };
    const a = treeAccessor(4, 2);
    expect(a(node)).to.eql(node.parent.parent);
  });

  it('should return flattened descendants when targetDepth is deeper than sourceDepth', () => {
    const c1 = { text: 'child1' };
    const c2 = { text: 'child2' };
    const c3 = { text: 'child3' };
    let node = {
      children: [
        { children: [c1, c2] },
        {}, // empty node on purpose
        { children: [] }, // empty array on purpose
        { children: [c3] }
      ]
    };
    const a = treeAccessor(2, 4);
    expect(a(node)).to.eql([c1, c2, c3]);
  });
});
