import {
  getPropsInfo,
  collect
} from '../util';

describe('data-util', () => {
  let ds;

  beforeEach(() => {
    ds = {
      field: sinon.stub(),
      key: 'nyckel'
    };
  });

  describe('config-normalizer', () => {
    it('should attach default accessors from field', () => {
      const reduceFn = () => ({});
      const valueFn = () => ({});
      ds.field.withArgs('f').returns({
        key: () => 'country',
        reduce: reduceFn,
        value: valueFn
      });
      const p = getPropsInfo({
        field: 'f'
      }, ds);

      expect(p.main.value).to.equal(valueFn);
      expect(p.main.reduce).to.equal(reduceFn);
    });

    it('should attach custom accessors', () => {
      const reduceFn = () => ({});
      const valueFn = () => ({});
      const labelFn = () => ({});
      ds.field.withArgs('f').returns({
        key: () => 'country',
        reduce: 'foo',
        value: 'foooo'
      });
      ds.field.withArgs('f2').returns({
        key: () => 'region',
        reduce: 'reg',
        value: 'regg'
      });
      const p = getPropsInfo({
        field: 'f',
        value: valueFn,
        reduce: reduceFn,
        label: labelFn,
        props: {
          x: {
            field: 'f2', value: 'val', reduce: 'sum', label: 'etikett'
          }
        }
      }, ds);

      expect(p.main.value).to.equal(valueFn);
      expect(p.main.reduce).to.equal(reduceFn);
      expect(p.main.label).to.equal(labelFn);
      expect(p.props.x.value).to.equal('val');
      expect(p.props.x.label).to.equal('etikett');
      expect(p.props.x.reduce).to.be.a('function');
    });

    it('should support fields array', () => {
      const reduceFn = () => ({});
      const reduceFn2 = () => ({});
      const reduceLbl = () => ({});
      const valueFn = () => ({});
      const multiReduceFn = () => {};
      const country = {
        key: () => 'country',
        reduce: () => 'red',
        reduceLabel: () => 'pink',
        value: 'foooo',
        label: 'lbl'
      };
      const region = {
        key: () => 'region',
        reduce: 'reg',
        reduceLabel: 'foo',
        value: 'regg'
      };
      ds.field.withArgs('f').returns(country);
      ds.field.withArgs('f2').returns(region);
      const p = getPropsInfo({
        field: 'f',
        value: valueFn,
        reduce: reduceFn,
        props: {
          x: {
            fields: [
              {
                field: 'f2',
                value: 'val',
                reduce: reduceFn2,
                reduceLabel: reduceLbl
              },
              { }
            ],
            reduce: multiReduceFn
          }
        }
      }, ds);

      expect(p.props.x.fields.length).to.equal(2);
      expect(p.props.x.reduce).to.equal(multiReduceFn);
      expect(p.props.x.fields[0]).to.eql({
        field: region,
        type: 'field',
        value: 'val',
        reduce: reduceFn2,
        reduceLabel: reduceLbl,
        label: undefined
      });
      expect(p.props.x.fields[1]).to.eql({
        field: country,
        value: 'foooo',
        reduce: country.reduce,
        reduceLabel: country.reduceLabel,
        label: 'lbl'
      }, 'sdfsdf');
    });

    it('should convert string reducer to a function', () => {
      ds.field.withArgs('f').returns({
        key: () => 'country',
        reduce: 'avg'
      });
      const p = getPropsInfo({
        field: 'f'
      }, ds);

      expect(p.main.reduce).to.be.a('function');
    });

    it('should accept a filter function', () => {
      ds.field.withArgs('f').returns({
        key: () => 'country'
      });
      const p = getPropsInfo({
        field: 'f',
        filter: () => {}
      }, ds);

      expect(p.main.filter).to.be.a('function');
    });

    it('should accept primitives and functions', () => {
      const f = {
        key: () => 'country'
      };
      ds.field.withArgs('f').returns(f);
      const fn = () => 3;
      const p = getPropsInfo({
        field: 'f',
        props: {
          x: 0,
          y: fn
        }
      }, ds);

      expect(p.props.x).to.eql({
        type: 'primitive',
        value: 0
      });
      expect(p.props.y).to.eql({
        field: f,
        type: 'function',
        value: fn,
        label: fn
      });
    });
  });

  describe('collector', () => {
    let tracked;
    let mainField;
    let pField;
    beforeEach(() => {
      tracked = [
        {
          items: [
            {
              value: 3,
              label: 'three',
              source: 'kjella',
              p: { value: 3.1, label: 'one', source: 'kp' }
            },
            {
              value: 7,
              label: 'seven',
              source: 'kjella',
              p: { value: 7.2, label: 'two', source: 'kp' }
            }
          ]
        }
      ];

      mainField = {
        formatter: () => (v => `$${v}`)
      };

      pField = {
        formatter: () => (v => `£${v}`)
      };
    });

    it('should collect values into an array when not using value reducer', () => {
      const main = { field: mainField };

      const props = {
        p: { field: pField }
      };

      const propsArr = Object.keys(props);
      const items = collect(tracked, { main, props, propsArr });

      expect(items).to.eql([{
        value: [3, 7],
        label: '$3,7',
        source: 'kjella',
        p: { value: [3.1, 7.2], label: '£3.1,7.2', source: 'kp' }
      }]);
    });

    it('should reduce value and labels', () => {
      const main = {
        field: mainField,
        reduce: values => values.join('::'),
        reduceLabel: labels => labels.join('-')
      };

      const props = {
        p: {
          field: pField,
          reduce: values => values.join('|'),
          reduceLabel: (labels, value) => `~${value}`
        }
      };
      const propsArr = Object.keys(props);

      const items = collect(tracked, { main, props, propsArr });

      expect(items).to.eql([{
        value: '3::7',
        label: 'three-seven',
        source: 'kjella',
        p: { value: '3.1|7.2', label: '~3.1|7.2', source: 'kp' }
      }]);
    });

    it('should reduce labels using field formatter when reduceLabel is not defined', () => {
      const main = {
        field: mainField,
        reduce: values => values.join('::')
      };

      const props = {
        p: {
          field: pField,
          reduce: values => values.join('|')
        }
      };
      const propsArr = Object.keys(props);

      const items = collect(tracked, { main, props, propsArr });

      expect(items).to.eql([{
        value: '3::7',
        label: '$3::7',
        source: 'kjella',
        p: { value: '3.1|7.2', label: '£3.1|7.2', source: 'kp' }
      }]);
    });
  });
});
