#! /usr/bin/env node

const cp = require('child_process');

let server;

function exit(a) {
  if (server) {
    server.kill();
  }

  if (a) {
    console.error(String(a));
    process.exit(1);
  } else {
    process.exit();
  }
}

function exec(cmd, stdio = 'inherit') {
  try {
    cp.execSync(cmd, {
      stdio
    });
    exit();
  } catch (e) {
    exit(e);
  }
}

server = cp.spawn('npm', ['run', 'test:integration:server']);
exec('npm run test:integration:local');
