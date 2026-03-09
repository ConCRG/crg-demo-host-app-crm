/**
 * Configures git submodule URL with auth token for private repos.
 * Set GH_TOKEN or CRG_SUBMODULE_TOKEN in Vercel env vars (GitHub PAT with repo scope).
 */
const { execSync } = require('child_process');

const token = process.env.GH_TOKEN || process.env.CRG_SUBMODULE_TOKEN;
if (!token) {
  console.warn('No GH_TOKEN or CRG_SUBMODULE_TOKEN set - submodule clone may fail for private repos');
  process.exit(0);
}

const url = `https://x-access-token:${token}@github.com/oshadha-dev/crg-platform.git`;
try {
  execSync('git', ['config', 'submodule.crg-platform.url', url], { stdio: 'inherit' });
} catch (err) {
  console.error('Failed to configure submodule URL:', err.message);
  process.exit(1);
}
