/**
 * Builds crg-platform using npm (avoids pnpm ERR_INVALID_THIS on Vercel).
 * Run patch:crg first so connector-react and sidecar-ui use file: deps.
 */
const fs = require('fs');
const { execSync } = require("child_process");
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

// Use node + npm-cli.js for install (avoids PATH); run tsup directly for build (avoids npm script spawn)
const nodeDir = path.dirname(process.execPath);
const npmCli = path.join(nodeDir, "..", "lib", "node_modules", "npm", "bin", "npm-cli.js");
// Ensure devDependencies (tsup) are installed - Vercel sets NODE_ENV=production
const npmEnv = {
  ...process.env,
  PATH: `${nodeDir}:${process.env.PATH || ""}`,
  NODE_ENV: "development",
};

const runNpmInstall = (cwd) => {
  execSync(`"${process.execPath}" "${npmCli}" install --include=dev`, {
    cwd,
    stdio: "inherit",
    env: npmEnv,
    shell: true,
  });
};

// connector-core always installs tsup; other packages deduplicate via file: ref and may not have it locally.
// Resolve tsup from cwd first, then fall back to connector-core's node_modules (same semver range).
const resolveTsupCli = (cwd) => {
  const candidates = [
    path.join(cwd, "node_modules", "tsup", "dist", "cli-default.js"),
    path.join(root, "connector-core", "node_modules", "tsup", "dist", "cli-default.js"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error(`tsup not found in any of:\n${candidates.join("\n")}`);
};

const ensureTsupAvailable = (cwd) => {
  const localTsup = path.join(cwd, "node_modules", "tsup");

  try {
    const stat = fs.lstatSync(localTsup);
    if (stat.isDirectory()) return;
    fs.rmSync(localTsup, { force: true });
  } catch {}

  const coreTsup = path.join(root, "connector-core", "node_modules", "tsup");
  if (!fs.existsSync(coreTsup)) return;

  const nodeModules = path.join(cwd, "node_modules");
  if (!fs.existsSync(nodeModules)) {
    fs.mkdirSync(nodeModules, { recursive: true });
  }
  fs.cpSync(coreTsup, localTsup, { recursive: true });
  console.log(`  Copied tsup from connector-core into ${path.basename(cwd)}`);
};

const runTsupBuild = (cwd) => {
  ensureTsupAvailable(cwd);
  const tsupCli = resolveTsupCli(cwd);
  const coreMods = path.join(root, "connector-core", "node_modules");
  const existingNodePath = npmEnv.NODE_PATH || "";
  execSync(`"${process.execPath}" "${tsupCli}" --no-dts`, {
    cwd,
    stdio: "inherit",
    env: {
      ...npmEnv,
      NODE_PATH: existingNodePath ? `${coreMods}:${existingNodePath}` : coreMods,
    },
  });
};

for (const pkg of order) {
  const cwd = path.join(root, pkg);
  console.log(`Building ${pkg}...`);
  runNpmInstall(cwd);
  runTsupBuild(cwd);
}
