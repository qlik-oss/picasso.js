import stack from '../stack';

describe('stack', () => {
  const valueField = { key: 'nyckel', field: 'sales' };
  let data;
  beforeEach(() => {
    data = {
      items: [
        { minor: { value: 1, source: valueField }, stack: 1 },
        { minor: { value: 2, source: valueField }, stack: 2 },
        { minor: { value: 3, source: valueField }, stack: 3 },
        { minor: { value: 4, source: valueField }, stack: 1 },
        { minor: { value: 5, source: valueField }, stack: 1 },
        { minor: { value: 6, source: valueField }, stack: 1 },
        { minor: { value: 7, source: valueField }, stack: 1 },
        { minor: { value: 8, source: valueField }, stack: 2 },
        { minor: { value: 9, source: valueField }, stack: 3 }
      ],
      fields: []
    };
  });

  it('should attach generated field', () => {
    stack(data, {
      stackKey: v => v.stack,
      value: v => v.minor.value
    });
    expect(data.fields[0].min()).to.eql(0);
    expect(data.fields[0].max()).to.eql(23);
  });

  it('should attach start and end properties', () => {
    stack(data, {
      stackKey: v => v.stack,
      value: v => v.minor.value
    });
    expect(data.items[8].start).to.eql({ value: 3 });
    expect(data.items[8].end).to.eql({ value: 12 });
  });
});
