/**
 * Workaround for npm optional deps bug (https://github.com/npm/cli/issues/4828).
 * Removes lockfile and node_modules so npm install fetches correct platform binaries.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const toRemove = [
  path.join(root, 'node_modules'),
  path.join(root, 'package-lock.json'),
  path.join(root, 'crm', 'node_modules'),
  path.join(root, 'crm-api', 'node_modules'),
];

for (const p of toRemove) {
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
    console.log('Removed:', p);
  }
}

execSync('npm install', { cwd: root, stdio: 'inherit' });
