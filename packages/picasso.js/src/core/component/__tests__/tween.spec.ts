import { findCommonPointsFromTwoLines } from '../tween';

describe('findCommonPointsFromTwoLines', () => {
  let oldLine;
  let currentLine;

  beforeEach(() => {
    oldLine = {
      key: 'old-line',
      points: [
        { data: { major: { value: 0 }, label: 'o0' } },
        { data: { major: { value: 1 }, label: 'o1' }, dummy: true },
        { data: { major: { value: 2 }, label: 'o2' }, dummy: false },
        { data: { major: { value: 3 }, label: 'o3' } },
      ],
    };

    currentLine = {
      key: 'new-line',
      points: [
        { data: { major: { value: 0 }, label: 'n0' }, dummy: true },
        { data: { major: { value: 1 }, label: 'n1' }, dummy: true },
        { data: { major: { value: 2 }, label: 'n2' }, dummy: false },
        { data: { major: { value: 3 }, label: 'n3' } },
      ],
    };
  });

  it('should return correct common points', () => {
    expect(findCommonPointsFromTwoLines(oldLine, currentLine)).to.deep.equal({
      old: [
        { data: { major: { value: 2 }, label: 'o2' }, dummy: false },
        { data: { major: { value: 3 }, label: 'o3' } },
      ],
      current: [
        { data: { major: { value: 2 }, label: 'n2' }, dummy: false },
        { data: { major: { value: 3 }, label: 'n3' } },
      ],
    });
  });
});
