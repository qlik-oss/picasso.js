/* eslint-disable */
declare global {
  // eslint-disable-next-line no-var
  var sinon: any;
  // eslint-disable-next-line no-var
  var global: typeof globalThis;

  namespace jest {
    interface Matchers<R, T = {}> {
      to: any;
      be: any;
      been: any;
      is: any;
      that: any;
      which: any;
      and: any;
      has: any;
      have: any;
      with: any;
      at: any;
      of: any;
      same: any;
      but: any;
      does: any;
      still: any;
      not: any;
      also: any;
      eql: any;
    }
  }
}

export {};
