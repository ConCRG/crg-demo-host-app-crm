/**
 * Configures git submodule URL with auth token for private repos.
 * Set GH_TOKEN or CRG_SUBMODULE_TOKEN in Vercel env vars (GitHub PAT with repo scope).
 * Removes stale crg-platform dir if Vercel's submodule fetch left a broken state.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const crgPlatform = path.join(__dirname, '..', 'crg-platform');
if (fs.existsSync(crgPlatform)) {
  fs.rmSync(crgPlatform, { recursive: true, force: true });
  console.log('Removed stale crg-platform directory');
}

const token = process.env.GH_TOKEN || process.env.CRG_SUBMODULE_TOKEN;
if (!token) {
  console.error('ERROR: GH_TOKEN or CRG_SUBMODULE_TOKEN environment variable is required');
  console.error('Set one of these in your Vercel project settings with a GitHub PAT that has repo access');
  process.exit(1);
}

const url = `https://x-access-token:${token}@github.com/oshadha-dev/crg-platform.git`;
try {
  execFileSync('git', ['config', 'submodule.crg-platform.url', url], { stdio: 'inherit' });
} catch (err) {
  console.error('Failed to configure submodule URL:', err.message);
  process.exit(1);
}
