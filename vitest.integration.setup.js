import { chromium } from '@playwright/test';
import { afterAll, beforeAll } from 'vitest';
import './vitest.setup.js';

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
