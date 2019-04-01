const serve = require('./serve');

before(async () => {
  await serve();
});

after(() => {
  // console.error('===== REACHED AFTER =====');
});
