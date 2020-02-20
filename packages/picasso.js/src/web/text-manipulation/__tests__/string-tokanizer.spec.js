import stringTokenizer, { MANDATORY, BREAK_ALLOWED, NO_BREAK } from '../string-tokenizer';

function toArray(iterator) {
  const ary = [];
  let token = iterator.next();

  while (!token.done) {
    ary.push(token);
    token = iterator.next();
  }

  return ary;
}

describe('String Tokenizer', () => {
  let tokens;

  it('should tokenize input string', () => {
    tokens = stringTokenizer({
      string: 'le',
      separator: '',
    });
    const ary = toArray(tokens);
    expect(ary).to.deep.equal([
      {
        index: 0,
        value: 'l',
        breakOpportunity: BREAK_ALLOWED,
        suppress: false,
        hyphenation: true,
        width: 1,
        height: 1,
        done: false,
      },
      {
        index: 1,
        value: 'e',
        breakOpportunity: BREAK_ALLOWED,
        suppress: false,
        hyphenation: true,
        width: 1,
        height: 1,
        done: false,
      },
    ]);
  });

  describe('Error handling', () => {
    it('should handle non-string types', () => {
      tokens = stringTokenizer({ string: null });
      const ary = toArray(tokens).map(t => t.value);
      expect(ary).to.deep.equal(['n', 'u', 'l', 'l']);
    });

    it('should handle no arguments', () => {
      tokens = stringTokenizer();
      const ary = toArray(tokens).map(t => t.value);
      expect(ary).to.deep.equal('undefined'.split(''));
    });
  });

  describe('Parameters', () => {
    it('should accept a string as seperator', () => {
      tokens = stringTokenizer({ string: 'H,e,j', separator: ',' });
      const ary = toArray(tokens).map(t => t.value);
      expect(ary).to.deep.equal(['H', 'e', 'j']);
    });

    it('should accept a regex as seperator', () => {
      tokens = stringTokenizer({ string: 'H,e,j', separator: /,/ });
      const ary = toArray(tokens).map(t => t.value);
      expect(ary).to.deep.equal(['H', 'e', 'j']);
    });

    it('should iterator from end to start of string', () => {
      tokens = stringTokenizer({ string: 'Hej', reverse: true });
      const ary = toArray(tokens).map(t => t.value);
      expect(ary).to.deep.equal(['j', 'e', 'H']);
    });

    it('should trigger mandatory break opportunity if mandatory break identifier resolves to true', () => {
      tokens = stringTokenizer({
        string: 'Hej',
        mandatoryBreakIdentifiers: [chunk => chunk === 'e', () => false],
      });
      const ary = toArray(tokens).map(t => t.breakOpportunity);
      expect(ary).to.deep.equal([BREAK_ALLOWED, MANDATORY, BREAK_ALLOWED]);
    });

    it('should trigger noBreak opportunity if any noBreak identifier resolves to true', () => {
      tokens = stringTokenizer({
        string: 'Hej',
        noBreakAllowedIdentifiers: [chunk => chunk === 'e', () => false],
      });
      const ary = toArray(tokens).map(t => t.breakOpportunity);
      expect(ary).to.deep.equal([BREAK_ALLOWED, NO_BREAK, BREAK_ALLOWED]);
    });

    it('should not trigger noBreak opportunity if mandatory identifier resolves to true', () => {
      tokens = stringTokenizer({
        string: 'Hej',
        mandatoryBreakIdentifiers: [() => true],
        noBreakAllowedIdentifiers: [() => true],
      });
      const ary = toArray(tokens).map(t => t.breakOpportunity);
      expect(ary).to.deep.equal([MANDATORY, MANDATORY, MANDATORY]);
    });

    it('should trigger suppress flag if any suppress identifier resolves to true', () => {
      tokens = stringTokenizer({
        string: 'Hej',
        suppressIdentifier: [chunk => chunk === 'e', () => false],
      });
      const ary = toArray(tokens).map(t => t.suppress);
      expect(ary).to.deep.equal([false, true, false]);
    });

    it('should accept a custom text metrics function', () => {
      tokens = stringTokenizer({
        string: 'Hej',
        measureText: () => ({ width: 11, height: 22 }),
      });
      const ary = toArray(tokens);
      const widths = ary.map(t => t.width);
      expect(widths).to.deep.equal([11, 11, 11]);
      const heights = ary.map(t => t.height);
      expect(heights).to.deep.equal([22, 22, 22]);
    });
  });
});
