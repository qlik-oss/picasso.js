import resolve from '../../../../src/core/style/resolver';

describe('style-resolver', () => {
  /* eslint quote-props: 0 */
  it('should resolve a primitive reference', () => {
    const s = resolve({ font: '$font-family' }, { '$font-family': 'Arial' });
    expect(s).to.eql({
      font: 'Arial'
    });
  });

  it('should resolve a mixin reference', () => {
    const s = resolve({ label: '$label--big' }, { '$label--big': { fontFamily: 'Arial', fontSize: '12px' } });
    expect(s).to.eql({
      label: {
        fontFamily: 'Arial',
        fontSize: '12px'
      }
    });
  });

  it('should not include variables', () => {
    const s = resolve({
      '$fill': 'red',
      font: 'foo',
      color: '$fill'
    }, {});
    expect(s).to.eql({
      font: 'foo',
      color: 'red'
    });
  });

  it('should resolve a mixin reference which in turn has references', () => {
    const references = {
      '$size--m': '12px',
      '$label--big': {
        fontFamily: 'Arial',
        fontSize: '$size--m'
      }
    };
    const input = { label: '$label--big' };
    const s = resolve(input, references);
    expect(s).to.eql({
      label: {
        fontFamily: 'Arial',
        fontSize: '12px'
      }
    });
  });

  it('should resolve an extended mixin', () => {
    const references = {
      '$size--l': '24px',
      '$label--m': {
        fontFamily: 'Arial',
        fontVariant: 'small-caps',
        fontSize: '12px'
      },
      '$label--big': {
        '@extend': '$label--m',
        fontSize: '$size--l'
      }
    };
    const input = { label: '$label--big' };
    const s = resolve(input, references);
    expect(s).to.eql({
      label: {
        fontFamily: 'Arial',
        fontSize: '24px',
        fontVariant: 'small-caps'
      }
    });
  });

  it('should extend in root node', () => {
    const references = {
      '$size--l': '24px',
      '$label--m': {
        fontFamily: 'Arial',
        fontVariant: 'small-caps',
        fontSize: '12px'
      }
    };
    const input = { '@extend': '$label--m' };
    const s = resolve(input, references);
    expect(s).to.eql({
      fontFamily: 'Arial',
      fontSize: '12px',
      fontVariant: 'small-caps'
    });
  });

  it('should extend something extended', () => {
    const references = {
      '$base': {
        strokeWidth: 3
      },
      '$size--l': '24px',
      '$label--m': {
        '@extend': '$base',
        fontFamily: 'Arial',
        fontVariant: 'small-caps',
        fontSize: '12px'
      },
      '$label--big': {
        '@extend': '$label--m',
        fontSize: '$size--l'
      }
    };
    const input = { label: '$label--big' };
    const s = resolve(input, references);
    expect(s).to.eql({
      label: {
        fontFamily: 'Arial',
        fontSize: '24px',
        fontVariant: 'small-caps',
        strokeWidth: 3
      }
    });
  });

  it('should throw error when finding a cyclical reference to itself', () => {
    const references = {
      '$label--big': {
        fontFamily: 'Arial',
        fontSize: '$label--big'
      }
    };
    const input = { label: '$label--big' };
    const fn = () => resolve(input, references);
    expect(fn).to.throw('Cyclical reference for "$label--big"');
  });

  it('should throw error when finding a cyclical reference to itself in something that it has extended', () => {
    const references = {
      '$base': {
        fontSize: '$label--big'
      },
      '$label--big': {
        '@extend': '$base',
        fontFamily: 'Arial'
      }
    };
    const input = { label: '$label--big' };
    const fn = () => resolve(input, references);
    expect(fn).to.throw('Cyclical reference for "$label--big"');
  });

  it('should throw error when finding a cyclical reference when extending itself', () => {
    const references = {
      '$base': {
        '@extend': '$label--big'
      },
      '$label--big': {
        '@extend': '$base',
        fontFamily: 'Arial'
      }
    };
    const input = { label: '$label--big' };
    const fn = () => resolve(input, references);
    expect(fn).to.throw('Cyclical reference for "$label--big"');
  });

  it('should resolve style recursively', () => {
    const references = {
      '$primary': 'red'
    };
    const input = {
      label: {
        fill: '$primary'
      }
    };
    const s = resolve(input, references);

    expect(s).to.eql({
      label: {
        fill: 'red'
      }
    });
  });

  it('should resolve style recursively in root', () => {
    const references = {
      '$primary': 'red',
      '$secondary': '$primary',
      '$alias': '$secondary'
    };
    const input = {
      color: '$alias'
    };
    const s = resolve(input, references);

    expect(s).to.eql({
      color: 'red'
    });
  });

  it('should throw error when finding primitive cyclical reference', () => {
    const references = {
      '$secondary': '$alias',
      '$alias': '$secondary'
    };
    const input = {
      color: '$alias'
    };
    const fn = () => resolve(input, references);
    expect(fn).to.throw('Cyclical reference for "$alias"');
  });

  it('should resolve style extend recursively with multiple input values', () => {
    const references = {
      '$grey': 'lightgrey',
      '$primary': {
        stroke: '$grey',
        strokeWidth: 1
      }
    };
    const input = {
      item: '$primary',
      label: {
        '@extend': '$primary',
        stroke: 'blue'
      }
    };
    const s = resolve(input, references);

    expect(s).to.eql({
      item: {
        stroke: 'lightgrey',
        strokeWidth: 1
      },
      label: {
        stroke: 'blue',
        strokeWidth: 1
      }
    });
  });
});
