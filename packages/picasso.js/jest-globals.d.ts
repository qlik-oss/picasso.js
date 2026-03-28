// Jest global type definitions for test setup
import chai from 'chai';
import sinon from 'sinon';

declare global {
  const expect: typeof chai.expect;
  const chai: typeof import('chai');
  const sinon: typeof sinon;
}

export {};
