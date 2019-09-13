class Matrix {
  /**
   * Creates a matrix with identity values.
   * @private
   */
  constructor() {
    this._elements = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];

    this._stack = [];
  }

  /**
   * Creates a new matrix with a copy of the current values.
   */
  clone() {
    const mt = new Matrix();
    return mt.multiply(this);
  }

  /**
  * Sets the matrix values
  * @param {Number[][]} arr A 3x3 array.
  */
  set(arr) {
    this._elements = arr;
    return this;
  }

  /**
  * Saves the current matrix values to a stack.
  */
  save() {
    this._stack.push(this.elements);
    return this;
  }

  /**
  * Sets the current matrix values to the last ones saved on to the stack.
  */
  restore() {
    if (this._stack.length) {
      this._elements = this._stack.pop(); // TODO - use a copy instead
    }
    return this;
  }

  /**
  * Adds a scalar value to each element in the matrix.
  * @param {Number} value
  */
  add(value) { // assume scalar
    let i,
      j;
    for (i = 0; i < this._elements.length; i++) {
      for (j = 0; j < this._elements[i].length; j++) {
        this._elements[i][j] += value;
      }
    }
    return this;
  }

  /**
  * Translates the current matrix along the x and y axis.
  * @param {Number} x
  * @param {Number} y
  */
  translate(x, y) {
    this.multiply([[1, 0, x], [0, 1, y], [0, 0, 1]]);
    return this;
  }

  /**
  * Rotates the current matrix.
  * @param {Number} radianAngle Angle in radians.
  */
  rotate(radianAngle) {
    let cos = Math.cos(-radianAngle),
      sin = Math.sin(-radianAngle);
    this.multiply([[cos, sin, 0], [-sin, cos, 0], [0, 0, 1]]);
    return this;
  }

  /**
  *
  * If value is a number; multiplies each element in the matrix by the given value.
  * If value is a matrix; multiplies the two matrices.
  * @param {Number|Array|Matrix} value
  */
  multiply(value) {
    let i,
      j,
      m,
      k;
    if (value instanceof Matrix) {
      value = value._elements;
    }
    if (Array.isArray(value)) { // matrix multiplication
      m = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ];
      for (i = 0; i < this._elements.length; i++) { // row
        for (j = 0; j < this._elements[i].length; j++) { // column
          for (k = 0; k < 3; k++) { // row
            m[i][j] += this._elements[i][k] * value[k][j];
          }
        }
      }
      this._elements = m;
    } else { // scalar multiplication
      for (i = 0; i < this._elements.length; i++) {
        for (j = 0; j < this._elements[i].length; j++) {
          this._elements[i][j] *= value;
        }
      }
    }
    return this;
  }

  /**
  * Scales the matrix along x and y axis.
  * @param {Number} x The value to scale the matrix with along the x direction
  * @param {Number} [y=x] The value to scale the matrix with along the y direction.
  */
  scale(x, y = x) {
    // if ( arguments.length < 2 || typeof y === "undefined" ) {
    //  y = x;
    // }

    this.multiply([[x, 0, 0], [0, y, 0], [0, 0, 1]]);
    return this;
  }

  /**
   * Multiples the matrix with the supplied transformation values
   * @param {Number} a Horizontal scaling
   * @param {Number} b Horizontal skewing
   * @param {Number} c Vertical skewing
   * @param {Number} d Vertical scaling
   * @param {Number} e Horizontal moving
   * @param {Number} f Vertical scaling
   */
  transform(a, b, c, d, e, f) {
    this.multiply([[a, c, e], [b, d, f], [0, 0, 1]]);

    return this;
  }

  /**
  * Gets the value of the determinant.
  * @return {Number}
  */
  determinant() {
    let a = this._elements[0][0],
      b = this._elements[0][1],
      c = this._elements[0][2],
      d = this._elements[1][0],
      e = this._elements[1][1],
      f = this._elements[1][2],
      g = this._elements[2][0],
      h = this._elements[2][1],
      i = this._elements[2][2],
      p = 0;

    p = ((a * e * i) + (b * f * g) + (c * d * h)) - (c * e * g) - (b * d * i) - (a * f * h);

    return p;
  }

  /**
  * Inverts the matrix.
  */
  invert() {
    let dt = this.determinant(),
      a = this._elements[0][0],
      b = this._elements[0][1],
      c = this._elements[0][2],
      d = this._elements[1][0],
      e = this._elements[1][1],
      f = this._elements[1][2],
      g = this._elements[2][0],
      h = this._elements[2][1],
      k = this._elements[2][2];

    this._elements = [
      [(e * k) - (f * h), (c * h) - (b * k), (b * f) - (c * e)],
      [(f * g) - (d * k), (a * k) - (c * g), (c * d) - (a * f)],
      [(d * h) - (e * g), (g * b) - (a * h), (a * e) - (b * d)]
    ];

    this.multiply(1 / dt); // TODO - handle when dt === 0 ?
    return this;
  }

  /**
  * Transposes the elements of the matrix.
  */
  transpose() {
    const m = Object.create(this._elements); // ?
    this._elements = [
      [m[0][0], m[1][0], m[2][0]],
      [m[0][1], m[1][1], m[2][1]],
      [m[0][2], m[1][2], m[2][2]]
    ];
    return this;
  }

  /**
  * Resets the inner elements of the matrix to identity values.
  */
  identity() {
    this._elements = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
    return this;
  }

  toString() {
    return `${this._elements.map((r) => r.join('\t')).join('\n')}`;
  }

  isIdentity() {
    const m = this._elements;
    return m[0][0] === 1 && m[0][1] === 0 && m[0][2] === 0
      && m[1][0] === 0 && m[1][1] === 1 && m[1][2] === 0
      && m[2][0] === 0 && m[2][1] === 0 && m[2][2] === 1;
  }

  /**
   * Transforms the given point by this matrix and returns a new point
   */
  transformPoint(p) {
    let vec = [p.x, p.y, 1],
      i,
      j,
      e = this._elements,
      m = [0, 0, 0];
    for (i = 0; i < this._elements.length; i++) { // row
      for (j = 0; j < this._elements[i].length; j++) { // column
        m[i] += vec[j] * e[i][j];
      }
    }

    return { x: m[0], y: m[1] };
  }

  /**
   * Transforms the given points by this matrix and returns the new points
   */
  transformPoints(array) {
    let vec,
      i,
      j,
      k,
      m,
      e = this._elements,
      ret = [];

    for (k = 0; k < array.length; k++) {
      vec = [array[k].x, array[k].y, 1];
      m = [0, 0, 0];

      for (i = 0; i < this._elements.length; i++) { // row
        for (j = 0; j < this._elements[i].length; j++) { // column
          m[i] += vec[j] * e[i][j];
        }
      }
      ret.push({ x: m[0], y: m[1] });
    }
    return ret;
  }

  get elements() {
    const m = this._elements;
    return [
      [m[0][0], m[0][1], m[0][2]],
      [m[1][0], m[1][1], m[1][2]],
      [m[2][0], m[2][1], m[2][2]]
    ];
  }
}

export default Matrix;
