import Node from '../node-container';

describe('TreeNode', () => {
  describe('upon instantiation', () => {
    it('should have no parent', () => {
      const n = new Node();
      expect(n.parent).to.be.null;
    });

    it('should have no children', () => {
      const n = new Node();
      expect(n.children.length).to.equal(0);
    });
  });

  describe('#addChild', () => {
    let n;
    describe('general', () => {
      beforeEach(() => {
        n = new Node();
      });
      afterEach(() => {
        n = null;
      });

      it('should have the right parent', () => {
        const c = new Node();
        n.addChild(c);

        expect(n.children.length).to.equal(1);
        expect(n.children[0]).to.equal(c);
        expect(c.parent).to.equal(n);
      });

      it('should not be possible to add anything else but a Node as child', () => {
        let f = () => {
            n.addChild();
          },
          ff = () => {
            n.addChild(null);
          },
          fff = () => {
            n.addChild({});
          };

        expect(f).to.throw('Expecting a Node as argument, but got undefined');
        expect(ff).to.throw('Expecting a Node as argument, but got null');
        expect(fff).to.throw('Expecting a Node as argument, but got [object Object]');
      });
    });

    describe('relatives -', () => {
      let a, a1, a2, a3, b, b1, b2;

      beforeEach(() => {
        n = new Node();
        a = new Node();
        a1 = new Node();
        a2 = new Node();
        a3 = new Node();
        b = new Node();
        b1 = new Node();
        b2 = new Node();

        n.addChild(a).addChild(b);

        a.addChild(a1)
          .addChild(a2)
          .addChild(a3);
        b.addChild(b1).addChild(b2);
      });
      afterEach(() => {
        n = null;
        a = null;
        a1 = null;
        a2 = null;
        a3 = null;
        b = null;
        b1 = null;
        b2 = null;
      });

      describe('parents', () => {
        it('none', () => {
          expect(n.parent).to.be.null;
        });

        it('parent', () => {
          expect(a.parent).to.equal(n);
          expect(a1.parent).to.equal(a);
          expect(a2.parent).to.equal(a);
          expect(a3.parent).to.equal(a);

          expect(b.parent).to.equal(n);
          expect(b1.parent).to.equal(b);
          expect(b2.parent).to.equal(b);
        });
      });

      describe('ancestors', () => {
        it('none', () => {
          expect(n.ancestors.length).to.equal(0);
        });

        it('parents', () => {
          expect(a.ancestors.length).to.equal(1);
          expect(a.ancestors[0]).to.equal(n);

          expect(b.ancestors.length).to.equal(1);
          expect(b.ancestors[0]).to.equal(n);
        });

        it('grandparents', () => {
          let aanc = [a, n],
            banc = [b, n];
          expect(a1.ancestors.length).to.equal(2);
          expect(a2.ancestors.length).to.equal(2);
          expect(a3.ancestors.length).to.equal(2);
          expect(a1.ancestors).to.deep.equal(aanc);
          expect(a2.ancestors).to.deep.equal(aanc);
          expect(a3.ancestors).to.deep.equal(aanc);

          expect(b1.ancestors.length).to.equal(2);
          expect(b2.ancestors.length).to.equal(2);
          expect(b1.ancestors).to.deep.equal(banc);
          expect(b2.ancestors).to.deep.equal(banc);
        });
      });
    });

    context('for related nodes', () => {
      beforeEach(() => {
        n = new Node();
      });
      afterEach(() => {
        n = null;
      });

      it('should not be possible to add itself as a child', () => {
        const f = () => {
          n.addChild(n);
        };
        expect(f).to.throw('Can not add itself as child!');
      });

      it('should not be possible to add a parent/ancestor as a child', () => {
        let a = new Node(),
          b = new Node(),
          c = new Node(),
          f = () => {
            b.addChild(a); // try adding parent as child
          },
          fn = () => {
            c.addChild(a); // try adding grandparent as child
          };
        a.addChild(b.addChild(c)); // a->b->c

        expect(f).to.throw('Can not add an ancestor as child!');
        expect(fn).to.throw('Can not add an ancestor as child!');
      });
    });
  });

  describe('#removeChild', () => {
    let n, a, a1, a2, a21, b, b1, b2;

    beforeEach(() => {
      n = new Node();
      a = new Node();
      a1 = new Node();
      a2 = new Node();
      a21 = new Node();
      b = new Node();
      b1 = new Node();
      b2 = new Node();

      n.addChild(a).addChild(b);

      a.addChild(a1).addChild(a2.addChild(a21));
      b.addChild(b1).addChild(b2);
    });

    afterEach(() => {
      n = null;
      a = null;
      a1 = null;
      a2 = null;
      a21 = null;
      b = null;
      b1 = null;
      b2 = null;
    });

    describe('after removing child from parent:', () => {
      beforeEach(() => {
        a.removeChild(a1);
      });
      context('child node', () => {
        it('should not have a parent', () => {
          expect(a1.parent).to.be.null;
        });

        it('should not have any ancestors', () => {
          expect(a1.ancestors.length).to.equal(0);
        });
      });

      context('parent node', () => {
        it('should have removed node as child', () => {
          expect(a.children.indexOf(a1)).to.equal(-1);
        });

        it('should have one child left', () => {
          expect(a.children.length).to.equal(1);
          expect(a.children[0]).to.equal(a2);
        });
      });
    });
  });

  describe('coupling/decoupling', () => {
    let n, a, a1, a2, a21, b, b1, b2;

    beforeEach(() => {
      n = new Node();
      a = new Node();
      a1 = new Node();
      a2 = new Node();
      a21 = new Node();
      b = new Node();
      b1 = new Node();
      b2 = new Node();
      n.addChild(a).addChild(b);

      a.addChild(a1).addChild(a2.addChild(a21));
      b.addChild(b1).addChild(b2);
    });
    afterEach(() => {
      n = null;
    });

    describe('adding a child that has a parent to another node:', () => {
      describe('child node', () => {
        it('should have new parent', () => {
          b.addChild(a2);
          expect(a2.parent).to.equal(b);
        });
      });

      describe('old parent node', () => {
        it('should not have old child as child any longer', () => {
          b.addChild(a2);
          expect(a.children.indexOf(a2)).to.equal(-1);
        });
      });

      describe('new parent node', () => {
        it('should have newly added child as child', () => {
          b.addChild(a2);
          expect(b.children.length).to.equal(3);
          expect(b.children[2]).to.equal(a2);
        });
      });
    });
  });
});
