const { cpSync, existsSync, mkdirSync, readdirSync, rmSync, rmdirSync } = require('node:fs');
const path = require('node:path');

const source = path.resolve(__dirname, '../../../.github/skills/picasso-chart-authoring');
const destination = path.resolve(__dirname, '../skills/picasso-chart-authoring');
const skillsDirectory = path.dirname(destination);
const action = process.argv[2];

if (action === 'stage') {
  if (!existsSync(source)) {
    throw new Error(`Skill source does not exist: ${source}`);
  }

  rmSync(destination, { recursive: true, force: true });
  mkdirSync(skillsDirectory, { recursive: true });
  cpSync(source, destination, { recursive: true });
} else if (action === 'clean') {
  rmSync(destination, { recursive: true, force: true });

  if (existsSync(skillsDirectory) && readdirSync(skillsDirectory).length === 0) {
    rmdirSync(skillsDirectory);
  }
} else {
  throw new Error('Expected action: stage or clean');
}