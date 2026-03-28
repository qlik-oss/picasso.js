/* eslint-disable */
declare global {
  // eslint-disable-next-line no-var
  var sinon: typeof import('sinon');
  // eslint-disable-next-line no-var
  var global: typeof globalThis;
  // eslint-disable-next-line no-var
  var expect: typeof import('chai').expect;
  // eslint-disable-next-line no-var
  var chai: typeof import('chai');

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
