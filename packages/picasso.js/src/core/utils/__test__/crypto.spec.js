import { hashObject } from '../../../../src/core/utils/crypto';

describe('gradient-support', () => {
  describe('hashObject', () => {
    it('should be consistent in hashing', () => {
      let result1 = hashObject({ test: { test: 'asdf' } });
      let result2 = hashObject({ qwerty: { test: 'xcvbnm' } });

      expect(result1).to.be.equal(-700955250);
      expect(result2).to.be.equal(-1685945998);
    });
  });
});
