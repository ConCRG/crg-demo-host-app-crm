/**
 * Builds crg-platform using npm (avoids pnpm ERR_INVALID_THIS on Vercel).
 * Run patch:crg first so connector-react and sidecar-ui use file: deps.
 */
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const crgRoot = path.join(__dirname, '..', 'crg-platform');
const root = path.join(crgRoot, 'packages');

// Remove pnpm artifacts so npm gets a clean slate
const toRemove = [
  path.join(crgRoot, 'node_modules'),
  path.join(crgRoot, 'pnpm-lock.yaml'),
  path.join(root, 'connector-core', 'node_modules'),
  path.join(root, 'connector-react', 'node_modules'),
  path.join(root, 'sidecar-ui', 'node_modules'),
  path.join(root, 'train-service', 'node_modules'),
];
for (const dir of toRemove) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
const order = ['connector-core', 'connector-react', 'sidecar-ui', 'train-service'];
const nodeDir = path.dirname(process.execPath);
const env = { ...process.env, PATH: `${nodeDir}:${process.env.PATH || ''}` };

for (const pkg of order) {
  const cwd = path.join(root, pkg);
  console.log(`Building ${pkg}...`);
  execSync('npm install', { cwd, stdio: 'inherit', env, shell: '/bin/bash' });
  execSync('npm run build', { cwd, stdio: 'inherit', env, shell: '/bin/bash' });
}
