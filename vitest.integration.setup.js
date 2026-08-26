import * as chai from 'chai';
import chaiSubset from 'chai-subset';
import { chromium } from '@playwright/test';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { afterAll, beforeAll } from 'vitest';

global.expect = chai.expect;
global.chai = chai;
global.sinon = sinon;

chai.use(sinonChai);
chai.use(chaiSubset);

beforeAll(async () => {
  global.browser = await chromium.launch();
  global.page = await global.browser.newPage();
});

afterAll(async () => {
  if (global.browser) {
    await global.page?.close();
    await global.browser.close();
  }
});
