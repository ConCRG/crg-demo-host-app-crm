/**
 * Replaces workspace:* with file: paths in crg-platform package.json files
 * so npm can resolve dependencies (npm does not support pnpm's workspace: protocol).
 */
const fs = require('fs');
const path = require('path');

const crgPlatform = path.join(__dirname, '..', 'crg-platform', 'packages');
const packages = ['connector-react', 'sidecar-ui'];

for (const pkg of packages) {
  const pkgPath = path.join(crgPlatform, pkg, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (pkgJson.dependencies && pkgJson.dependencies['@crg/connector-core'] === 'workspace:*') {
    pkgJson.dependencies['@crg/connector-core'] = 'file:../connector-core';
    fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + '\n');
  }
}
