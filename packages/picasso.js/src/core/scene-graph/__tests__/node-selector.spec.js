import Container from '../display-objects/container';
import Circle from '../display-objects/circle';
import Rect from '../display-objects/rect';
import Text from '../display-objects/text';
import selector, { tokenize, filter } from '../node-selector';

describe('Node Selector', () => {
  let UNDEF;

  describe('Tokenize', () => {
    it('should support multiple groups', () => {
      const token = tokenize('Circle, foo, [color="red"], *');
      expect(token).to.deep.equal([
        [{ type: 'type', value: 'Circle' }],
        [{ type: 'type', value: 'foo' }],
        [{
          type: 'attr', value: '[color="red"]', attribute: 'color', operator: '=', attributeValue: 'red'
        }],
        [{ type: 'universal', value: '*' }]
      ]);
    });

    it('should support multiple selectors within same group', () => {
      const token = tokenize('container rings ring');
      expect(token).to.deep.equal([
        [
          { type: 'type', value: 'container' },
          { type: ' ', value: ' ' },
          { type: 'type', value: 'rings' },
          { type: ' ', value: ' ' },
          { type: 'type', value: 'ring' }
        ]
      ]);
    });

    it('should support combination of type and attribute', () => {
      const token = tokenize('Circle[fill]');
      expect(token).to.deep.equal([
        [
          { type: 'type', value: 'Circle' },
          {
            type: 'attr', value: '[fill]', attribute: 'fill', operator: UNDEF, attributeValue: UNDEF
          }
        ]
      ]);
    });

    describe('type', () => {
      it('should support exact class name', () => {
        const token = tokenize('Circle');
        expect(token).to.deep.equal([
          [{ type: 'type', value: 'Circle' }]
        ]);
      });

      it('should support hyphenated class name', () => {
        const token = tokenize('my-shape');
        expect(token).to.deep.equal([
          [{ type: 'type', value: 'my-shape' }]
        ]);
      });
    });

    describe('attribute', () => {
      it('should support attribute existance', () => {
        const token = tokenize('[wohoo]');
        expect(token).to.deep.equal([
          [{
            type: 'attr', value: '[wohoo]', attribute: 'wohoo', operator: UNDEF, attributeValue: UNDEF
          }]
        ]);
      });

      it('should support attribute value', () => {
        const token = tokenize('[color="red"]');
        expect(token).to.deep.equal([
          [{
            type: 'attr', value: '[color="red"]', attribute: 'color', operator: '=', attributeValue: 'red'
          }]
        ]);
      });

      it('should support empty attribute value', () => {
        const token = tokenize('[color=""]');
        expect(token).to.deep.equal([
          [{
            type: 'attr', value: '[color=""]', attribute: 'color', operator: '=', attributeValue: ''
          }]
        ]);
      });

      it('should support combinations of attributes', () => {
        const token = tokenize('[fill][color="blue"][stroke!="red"] [foo="woo"]');
        expect(token).to.deep.equal([
          [
            {
              type: 'attr', value: '[fill]', attribute: 'fill', operator: UNDEF, attributeValue: UNDEF
            },
            {
              type: 'attr', value: '[color="blue"]', attribute: 'color', operator: '=', attributeValue: 'blue'
            },
            {
              type: 'attr', value: '[stroke!="red"]', attribute: 'stroke', operator: '!=', attributeValue: 'red'
            },
            { type: ' ', value: ' ' },
            {
              type: 'attr', value: '[foo="woo"]', attribute: 'foo', operator: '=', attributeValue: 'woo'
            }
          ]
        ]);
      });
    });

    describe('universal', () => {
      it('should support universal selector', () => {
        const token = tokenize('*');
        expect(token).to.deep.equal([
          [{ type: 'universal', value: '*' }]
        ]);
      });

      it('should support universal selector within a group', () => {
        const token = tokenize('Circle *');
        expect(token).to.deep.equal([
          [
            { type: 'type', value: 'Circle' },
            { type: ' ', value: ' ' },
            { type: 'universal', value: '*' }
          ]
        ]);
      });
    });

    describe('tag', () => {
      it('should support tag selector', () => {
        const token = tokenize('.test');
        expect(token).to.deep.equal([
          [{ type: 'tag', value: '.test' }]
        ]);
      });

      it('should support combinations of tag selector', () => {
        const token = tokenize('.test.myTag');
        expect(token).to.deep.equal([
          [
            { type: 'tag', value: '.test' },
            { type: 'tag', value: '.myTag' }
          ]
        ]);
      });
    });
  });

  describe('filter', () => {
    let c1;
    let c2;
    let c3;
    let t1;
    let r1;
    beforeEach(() => {
      c1 = new Circle();
      c2 = new Circle();
      c3 = new Circle();
      t1 = new Text();
      r1 = new Rect();
    });

    describe('type', () => {
      it('should select all objects of a given type', () => {
        const result = filter(
          { type: 'type', value: 'Circle' },
          [c1, c2, c3, t1, r1]
        );
        expect(result).to.deep.equal([c1, c2, c3]);
      });
    });

    describe('attr', () => {
      it('should select all objects with a defined color attribute', () => {
        c2.attrs.color = 'foo';
        r1.attrs.color = 'wooo';
        const result = filter(
          {
            type: 'attr', value: '[color]', attribute: 'color', operator: UNDEF, attributeValue: UNDEF
          },
          [c1, c2, c3, t1, r1]
        );
        expect(result).to.deep.equal([c2, r1]);
      });

      it('should select all objects that have attribute color="red"', () => {
        c1.attrs.color = 'green';
        c2.attrs.color = 'red';
        c3.attrs.color = 'blue';
        r1.attrs.color = 'red';
        const result = filter(
          {
            type: 'attr', value: '[color]', attribute: 'color', operator: '=', attributeValue: 'red'
          },
          [c1, c2, c3, t1, r1]
        );
        expect(result).to.deep.equal([c2, r1]);
      });

      it('should select all objects that have attribute color!="red"', () => {
        c1.attrs.color = 'green';
        c2.attrs.color = 'red';
        c3.attrs.color = 'blue';
        r1.attrs.color = 'red';
        t1.attrs.color = 'yellow';
        const result = filter(
          {
            type: 'attr', value: '[color]', attribute: 'color', operator: '!=', attributeValue: 'red'
          },
          [c1, c2, c3, t1, r1]
        );
        expect(result).to.deep.equal([c1, c3, t1]);
      });
    });

    describe('universal', () => {
      it('should select all objects', () => {
        const result = filter(
          { type: 'universal', value: '*' },
          [c1, c2, c3, t1, r1]
        );
        expect(result).to.deep.equal([c1, c2, c3, t1, r1]);
      });
    });

    describe('tag', () => {
      it('should select all objects that contains tag', () => {
        c1.tag = 'title myTag label';
        c2.tag = 'myTag-plus myTagPlus';
        t1.tag = 'myTag';
        const result = filter(
          { type: 'tag', value: '.myTag' },
          [c1, c2, c3, t1, r1]
        );
        expect(result).to.deep.equal([c1, t1]);
      });

      it('should handle multiple whitespaces in tag', () => {
        c1.tag = 'hello    myTag';
        const result = filter(
          { type: 'tag', value: '.myTag' },
          [c1, c2, c3, t1, r1]
        );
        expect(result).to.deep.equal([c1]);
      });

      it('should be case-sensitive', () => {
        c1.tag = 'myTag';
        let result = filter(
          { type: 'tag', value: '.mytag' },
          [c1, c2, c3, t1, r1]
        );
        expect(result).to.deep.equal([]);

        c1.tag = 'mytag';
        result = filter(
          { type: 'tag', value: '.myTag' },
          [c1, c2, c3, t1, r1]
        );
        expect(result).to.deep.equal([]);
      });

      it('should not match empty tag', () => {
        c1.tag = '';
        c2.tag = ' test-tag ';
        const result = filter(
          { type: 'tag', value: '.' },
          [c1, c2, c3, t1, r1]
        );

        expect(result).to.be.empty;
      });
    });
  });

  describe('find', () => {
    let c1;
    let c2;
    let c3;
    let t1;
    let r1;
    let con1;
    beforeEach(() => {
      c1 = new Circle();
      c2 = new Circle();
      c3 = new Circle();
      t1 = new Text();
      r1 = new Rect();
      con1 = new Container();
    });

    it('should find all objects that have attribute color="red" and stroke="black"', () => {
      c1.attrs.color = 'red';
      c1.attrs.stroke = 'green';

      c2.attrs.color = 'red';

      c3.attrs.stroke = 'black';

      r1.attrs.color = 'red';
      r1.attrs.stroke = 'black';

      t1.attrs.color = 'red';
      t1.attrs.stroke = 'black';

      con1.addChildren([c1, c2, c3, r1, t1]);

      const result = selector.find('[color="red"][stroke="black"]', con1);

      expect(result).to.deep.equal([r1, t1]);
    });

    it('should find objects that are descendants of another object', () => {
      const con2 = new Container();
      con2.addChildren([c1, r1]);
      con1.addChildren([con2, t1]);

      const result = selector.find('Container Circle', con1);

      expect(result).to.deep.equal([c1]);
    });

    it('should find all objects that are descendants', () => {
      const con2 = new Container();
      const con3 = new Container();
      con3.addChildren([c2, c3]);
      con2.addChildren([c1, r1, con3]);
      con1.addChildren([con2, t1]);

      const result = selector.find('Container *', con1);

      expect(result).to.deep.equal([c1, r1, con3, c2, c3]);
    });

    it('should find all objects that contains multiple tags', () => {
      c1.tag = 'myTag label test';
      c2.tag = 'myTag test';
      c3.tag = 'myTag'; // Should not match as it only contains one of the tags

      con1.addChildren([c1, c2, c3, r1, t1]);

      const result = selector.find('.myTag.test', con1);

      expect(result).to.deep.equal([c1, c2]);
    });
  });
});
