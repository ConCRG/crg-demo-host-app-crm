/**
 * Builds crg-platform using npm (avoids pnpm ERR_INVALID_THIS on Vercel).
 * Run patch:crg first so connector-react and sidecar-ui use file: deps.
 */
const fs = require('fs');
const { execSync, execFileSync } = require('child_process');
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

// Invoke npm via node to avoid PATH issues on Vercel (status 127)
const nodeDir = path.dirname(process.execPath);
const npmCli = path.join(nodeDir, '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js');
const runNpm = (args, cwd) => {
  if (fs.existsSync(npmCli)) {
    execFileSync('node', [npmCli, ...args], { cwd, stdio: 'inherit', env: process.env });
  } else {
    const env = { ...process.env, PATH: `${nodeDir}:${process.env.PATH || ''}` };
    execSync(`npm ${args.join(' ')}`, { cwd, stdio: 'inherit', env, shell: '/bin/bash' });
  }
};

for (const pkg of order) {
  const cwd = path.join(root, pkg);
  console.log(`Building ${pkg}...`);
  runNpm(['install'], cwd);
  runNpm(['run', 'build'], cwd);
}
