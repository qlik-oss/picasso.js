import extract from '../extractor-matrix';

describe('straight mapping', () => {
  const fields = [
    { key: () => 'fkey', items: () => ['SE', 'IT', 'SE'], formatter: () => ((v) => `_${v}_`) },
    { key: () => 'fkey2', items: () => [3, 7, 2], formatter: () => ((v) => `$${v}`) }
  ];

  const dataset = {
    field: (idx) => fields[idx],
    key: () => 'nyckel'
  };

  it('should return dim field values based on default field accessor', () => {
    const m = extract({ field: 0 }, dataset);
    expect(m).to.eql([
      { value: 'SE', label: 'SE', source: { field: 'fkey', key: 'nyckel' } },
      { value: 'IT', label: 'IT', source: { field: 'fkey', key: 'nyckel' } },
      { value: 'SE', label: 'SE', source: { field: 'fkey', key: 'nyckel' } }
    ]);
  });

  it('should return joined set when array of fields is used', () => {
    const m = extract([{ field: 1 }, { field: 0 }], dataset);
    expect(m).to.eql([
      { value: 3, label: '3', source: { field: 'fkey2', key: 'nyckel' } },
      { value: 7, label: '7', source: { field: 'fkey2', key: 'nyckel' } },
      { value: 2, label: '2', source: { field: 'fkey2', key: 'nyckel' } },
      { value: 'SE', label: 'SE', source: { field: 'fkey', key: 'nyckel' } },
      { value: 'IT', label: 'IT', source: { field: 'fkey', key: 'nyckel' } },
      { value: 'SE', label: 'SE', source: { field: 'fkey', key: 'nyckel' } }
    ]);
  });

  it('should support custom accessor', () => {
    const m = extract({
      field: 0,
      value: (v) => `-${v}-`,
      label: (v) => `=${v}=`
    }, dataset);
    expect(m).to.eql([
      { value: '-SE-', label: '=SE=', source: { field: 'fkey', key: 'nyckel' } },
      { value: '-IT-', label: '=IT=', source: { field: 'fkey', key: 'nyckel' } },
      { value: '-SE-', label: '=SE=', source: { field: 'fkey', key: 'nyckel' } }
    ]);
  });

  it('should return mapped properties from same field', () => {
    const m = extract({
      field: 0,
      props: { text: { value: (v) => `(${v})` } }
    }, dataset);
    expect(m).to.eql([
      {
        value: 'SE', label: 'SE', source: { field: 'fkey', key: 'nyckel' }, text: { value: '(SE)', label: '(SE)', source: { field: 'fkey', key: 'nyckel' } }
      },
      {
        value: 'IT', label: 'IT', source: { field: 'fkey', key: 'nyckel' }, text: { value: '(IT)', label: '(IT)', source: { field: 'fkey', key: 'nyckel' } }
      },
      {
        value: 'SE', label: 'SE', source: { field: 'fkey', key: 'nyckel' }, text: { value: '(SE)', label: '(SE)', source: { field: 'fkey', key: 'nyckel' } }
      }
    ]);
  });

  it('should return primitive values', () => {
    const m = extract({
      field: 1,
      value: 'foo',
      props: {
        num: 0,
        bool: false
      }
    }, dataset);
    expect(m).to.eql([
      {
        value: 'foo',
        label: 'foo',
        source: { field: 'fkey2', key: 'nyckel' },
        num: { value: 0, label: '0' },
        bool: { value: false, label: 'false' }
      },
      {
        value: 'foo',
        label: 'foo',
        source: { field: 'fkey2', key: 'nyckel' },
        num: { value: 0, label: '0' },
        bool: { value: false, label: 'false' }
      },
      {
        value: 'foo',
        label: 'foo',
        source: { field: 'fkey2', key: 'nyckel' },
        num: { value: 0, label: '0' },
        bool: { value: false, label: 'false' }
      }
    ]);
  });

  it('should return mapped properties from other fields', () => {
    const m = extract({
      field: 0,
      props: {
        num: { field: 1 }
      }
    }, dataset);
    expect(m).to.eql([
      {
        value: 'SE', label: 'SE', source: { field: 'fkey', key: 'nyckel' }, num: { value: 3, label: '3', source: { field: 'fkey2', key: 'nyckel' } }
      },
      {
        value: 'IT', label: 'IT', source: { field: 'fkey', key: 'nyckel' }, num: { value: 7, label: '7', source: { field: 'fkey2', key: 'nyckel' } }
      },
      {
        value: 'SE', label: 'SE', source: { field: 'fkey', key: 'nyckel' }, num: { value: 2, label: '2', source: { field: 'fkey2', key: 'nyckel' } }
      }
    ]);
  });

  it('should filter values on main field', () => {
    const m = extract({
      field: 0,
      filter: (v) => v !== 'IT'
    }, dataset);
    expect(m).to.eql([
      { value: 'SE', label: 'SE', source: { field: 'fkey', key: 'nyckel' } },
      { value: 'SE', label: 'SE', source: { field: 'fkey', key: 'nyckel' } }
    ]);
  });

  it('should return collected values', () => {
    const m = extract({
      field: 0,
      trackBy: (v) => v,
      props: {
        item: { field: 1 }
      }
    }, dataset);
    expect(m).to.eql([
      {
        source: { field: 'fkey', key: 'nyckel' },
        value: ['SE', 'SE'],
        label: '_SE,SE_',
        item: { value: [3, 2], label: '$3,2', source: { field: 'fkey2', key: 'nyckel' } }
      },
      {
        source: { field: 'fkey', key: 'nyckel' },
        value: ['IT'],
        label: '_IT_',
        item: { value: [7], label: '$7', source: { field: 'fkey2', key: 'nyckel' } }
      }
    ]);
  });

  it('should return reduced values', () => {
    const ffs = [
      { key: () => 'fkey', items: () => ['SE', 'IT', 'SE', 'SE', 'SE'], formatter: () => ((v) => `_${v}_`) },
      { key: () => 'fkey2', items: () => [5, 25, 4, 8, 7], formatter: () => ((v) => `£${v}`) }
    ];
    const ds = {
      field: (idx) => ffs[idx],
      key: () => 'nyckel'
    };
    const m = extract({
      field: 0,
      trackBy: (v) => v,
      reduce: (values) => values.join('--'),
      props: {
        item: { reduce: 'first' },
        min: { field: 1, reduce: 'min' },
        max: { field: 1, reduce: 'max' },
        sum: { field: 1, reduce: 'sum' },
        avg: { field: 1, reduce: 'avg' },
        first: { field: 1, reduce: 'first' },
        last: { field: 1, reduce: 'last' }
      }
    }, ds);
    expect(m).to.eql([
      {
        value: 'SE--SE--SE--SE',
        label: '_SE--SE--SE--SE_',
        source: { field: 'fkey', key: 'nyckel' },
        item: { value: 'SE', label: '_SE_', source: { field: 'fkey', key: 'nyckel' } },
        min: { value: 4, label: '£4', source: { field: 'fkey2', key: 'nyckel' } },
        max: { value: 8, label: '£8', source: { field: 'fkey2', key: 'nyckel' } },
        sum: { value: 24, label: '£24', source: { field: 'fkey2', key: 'nyckel' } },
        avg: { value: 6, label: '£6', source: { field: 'fkey2', key: 'nyckel' } },
        first: { value: 5, label: '£5', source: { field: 'fkey2', key: 'nyckel' } },
        last: { value: 7, label: '£7', source: { field: 'fkey2', key: 'nyckel' } }
      },
      {
        value: 'IT',
        label: '_IT_',
        source: { field: 'fkey', key: 'nyckel' },
        item: { value: 'IT', label: '_IT_', source: { field: 'fkey', key: 'nyckel' } },
        min: { value: 25, label: '£25', source: { field: 'fkey2', key: 'nyckel' } },
        max: { value: 25, label: '£25', source: { field: 'fkey2', key: 'nyckel' } },
        sum: { value: 25, label: '£25', source: { field: 'fkey2', key: 'nyckel' } },
        avg: { value: 25, label: '£25', source: { field: 'fkey2', key: 'nyckel' } },
        first: { value: 25, label: '£25', source: { field: 'fkey2', key: 'nyckel' } },
        last: { value: 25, label: '£25', source: { field: 'fkey2', key: 'nyckel' } }
      }
    ]);
  });
});
