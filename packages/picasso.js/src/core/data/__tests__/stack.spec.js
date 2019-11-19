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
      stackKey: (v) => v.stack,
      value: (v) => v.minor.value
    });
    expect(data.fields[0].min()).to.eql(0);
    expect(data.fields[0].max()).to.eql(23);
  });

  it('should attach start and end properties', () => {
    stack(data, {
      stackKey: (v) => v.stack,
      value: (v) => v.minor.value
    });
    expect(data.items[8].start).to.eql({ value: 3 });
    expect(data.items[8].end).to.eql({ value: 12 });
  });
});

describe('item order', () => {
  const valueField = { key: 'nyckel', field: 'sales' };
  let data;
  beforeEach(() => {
    data = {
      items: [
        { minor: { value: 1, source: valueField }, stack: 1, id: 2 },
        { minor: { value: 2, source: valueField }, stack: 1, id: 3 },
        { minor: { value: 3, source: valueField }, stack: 2, id: 1 },
        { minor: { value: 4, source: valueField }, stack: 2, id: 2 },
        { minor: { value: 5, source: valueField }, stack: 2, id: 3 },
        { minor: { value: 6, source: valueField }, stack: 3, id: 1 },
        { minor: { value: 7, source: valueField }, stack: 3, id: 2 },
        { minor: { value: 8, source: valueField }, stack: 3, id: 3 }
      ],
      fields: []
    };
  });

  it('should attach generated field', () => {
    stack(data, {
      stackKey: (v) => v.stack,
      value: (v) => v.minor.value
    });
    expect(data.fields[0].min()).to.eql(0);
    expect(data.fields[0].max()).to.eql(21);
  });

  it('should have correct item order in each stack', () => {
    stack(data, {
      stackKey: (v) => v.stack,
      value: (v) => v.minor.value,
      itemOrderKey: (v) => v.id
    });
    expect(data.items[0].start).to.eql({ value: 0 });
    expect(data.items[0].end).to.eql({ value: 1 });
    expect(data.items[1].start).to.eql({ value: 1 });
    expect(data.items[1].end).to.eql({ value: 3 });
    expect(data.items[2].start).to.eql({ value: 9 });
    expect(data.items[2].end).to.eql({ value: 12 });
    expect(data.items[3].start).to.eql({ value: 0 });
    expect(data.items[3].end).to.eql({ value: 4 });
    expect(data.items[4].start).to.eql({ value: 4 });
    expect(data.items[4].end).to.eql({ value: 9 });
    expect(data.items[5].start).to.eql({ value: 15 });
    expect(data.items[5].end).to.eql({ value: 21 });
    expect(data.items[6].start).to.eql({ value: 0 });
    expect(data.items[6].end).to.eql({ value: 7 });
    expect(data.items[7].start).to.eql({ value: 7 });
    expect(data.items[7].end).to.eql({ value: 15 });
  });
});
