import Matrix from '../matrix';

describe('Matrix', () => {
  let m;

  beforeEach(() => {
    m = new Matrix();
  });

  afterEach(() => {
    m = null;
  });

  it('should default to identity matrix', () => {
    expect(m.elements).to.deep.equal([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
    expect(m.isIdentity()).to.equal(true);
  });

  it('should handle setting element values', () => {
    m.set([[2, 1, 2], [7, 1, 3], [3, 5, 9]]);
    expect(m.elements).to.deep.equal([[2, 1, 2], [7, 1, 3], [3, 5, 9]]);
  });

  it('should calculate addition', () => {
    m.add(2);
    expect(m.elements).to.deep.equal([[3, 2, 2], [2, 3, 2], [2, 2, 3]]);

    m.add(-3);
    expect(m.elements).to.deep.equal([[0, -1, -1], [-1, 0, -1], [-1, -1, 0]]);
  });

  it('should calculate scalar multiplication', () => {
    m.set([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    m.multiply([[2, 3, 5], [7, 2, 9], [1, 4, 8]]);
    expect(m.elements).to.deep.equal([[19, 19, 47], [49, 46, 113], [79, 73, 179]]);
  });

  it('should reset the matrix to identity values', () => {
    m.set([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    m.identity();
    expect(m.elements).to.deep.equal([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
  });

  it('should calculate affine translation', () => {
    m.set([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    m.translate(3, -1);
    expect(m.elements).to.deep.equal([[1, 2, 4], [4, 5, 13], [7, 8, 22]]);

    m.translate(-3, 1);
    expect(m.elements).to.deep.equal([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
  });

  it('should calculate affine rotation', () => {
    m.set([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    m.rotate(Math.PI / 4);
    // expect( m.elements ).to.deep.equal( [[1, 2, 4],[4, 5, 13] , [7, 8, 22]] );

    // m.rotate( Math.PI/4 );
    // m.rotate( -Math.PI/2);
  });

  it('should calculate affine scaling', () => {
    m.set([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    m.scale(2, 3);
    expect(m.elements).to.deep.equal([[2, 6, 3], [8, 15, 6], [14, 24, 9]]);

    m.scale(0.5, 1 / 3);
    expect(m.elements).to.deep.equal([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

    m.scale(2);
    expect(m.elements).to.deep.equal([[2, 4, 3], [8, 10, 6], [14, 16, 9]]);
  });

  it('should transpose the matrix', () => {
    m.set([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    m.transpose();
    expect(m.elements).to.deep.equal([[1, 4, 7], [2, 5, 8], [3, 6, 9]]);

    m.transpose();
    expect(m.elements).to.deep.equal([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
  });

  it('should return determinant value', () => {
    m.set([[2, 1, 2], [7, 1, 3], [3, 5, 9]]);
    expect(m.determinant()).to.equal(-2);

    m.set([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    expect(m.determinant()).to.equal(0);
  });

  it('should invert the matrix', () => {
    m.set([[2, 1, 2], [7, 1, 3], [3, 5, 9]]);
    m.invert();
    expect(m.elements).to.deep.equal([[3, -0.5, -0.5], [27, -6, -4], [-16, 3.5, 2.5]]);
    m.invert();
    expect(m.elements).to.deep.equal([[2, 1, 2], [7, 1, 3], [3, 5, 9]]);
  });

  it('should handle linear transformations', () => {
    m.translate(10, 10);
    m.scale(2, 2);
    m.translate(-5, -5);
    m.scale(0.5, 0.5);
    expect(m.elements).to.deep.equal([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
  });

  it('should handle transform by a six value coordinate system', () => {
    m.transform(1, 2, 3, 4, 5, 6);
    expect(m.elements).to.deep.equal([[1, 3, 5], [2, 4, 6], [0, 0, 1]]);
  });

  it('should clone element values', () => {
    m.set([[2, 1, 2], [7, 1, 3], [3, 5, 9]]);
    const c = m.clone();
    expect(c.elements).to.deep.equal([[2, 1, 2], [7, 1, 3], [3, 5, 9]]);
  });

  it('should maintain a stack of transforms', () => {
    m.set([[2, 1, 2], [7, 1, 3], [3, 5, 9]]);
    expect(m.save().add(1).elements).to.deep.equal([[3, 2, 3], [8, 2, 4], [4, 6, 10]]);
    expect(m.restore().elements).to.deep.equal([[2, 1, 2], [7, 1, 3], [3, 5, 9]]);

    // empty stack -> next restore should not affect element values
    expect(m.restore().elements).to.deep.equal([[2, 1, 2], [7, 1, 3], [3, 5, 9]]);
  });

  it('should print nicely', () => {
    expect(`${m}`).to.equal('1\t0\t0\n0\t1\t0\n0\t0\t1');
  });
});
