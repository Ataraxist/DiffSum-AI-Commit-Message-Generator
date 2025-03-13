import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

console.log("^_____^ Running setup.js postinstall script...");

// Resolve script directory
const scriptDir = path.dirname(fileURLToPath(import.meta.url));

// Function to find the Git root directory
const findGitRoot = (dir) => {
  if (fs.existsSync(path.join(dir, '.git'))) return dir;
  const parent = path.dirname(dir);
  return parent !== dir ? findGitRoot(parent) : null;
};

// Locate Git root
const gitRoot = findGitRoot(process.cwd());

if (!gitRoot) {
  console.warn('≧ ﹏ ≦ No Git repository detected. Skipping Git hook installation.');
  process.exit(0);
} else {
  console.log(`( $ _ $ ) Found Git root at: ${gitRoot}`);
}

// Dynamically determine the `node_modules` directory
const findNodeModules = (dir) => {
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'node_modules'))) return path.join(dir, 'node_modules');
    dir = path.dirname(dir);
  }
  return null;
};

const nodeModulesPath = findNodeModules(scriptDir);
if (!nodeModulesPath) {
  console.warn('o((⊙﹏⊙))o. Could not determine node_modules path. Some features may not work as expected.');
} else {
  console.log(`♪(^∇^*) Detected node_modules path: ${nodeModulesPath}`);
}

// Define paths
const hooksDir = path.join(gitRoot, '.git', 'hooks');
const hookFile = path.join(hooksDir, 'prepare-commit-msg');
const sourceFile = path.join(scriptDir, 'prepare-commit-msg'); // Uses scriptDir

// Ensure .git/hooks directory exists
fs.mkdirSync(hooksDir, { recursive: true });

// Attempt to create the Git hook
try {
  console.log(`📂 Copying hook from ${sourceFile} to ${hookFile}`);
  fs.copyFileSync(sourceFile, hookFile);
  fs.chmodSync(hookFile, 0o755);
  console.log('( •̀ ω •́ )✧ Git hook installed successfully!');
} catch (error) {
  console.error('ㄟ( ▔, ▔ )ㄏ Error installing Git hook:', error);
  process.exit(1);
}

// Done
console.log('(￣y▽￣)╭ Ohohoho..... Run `npx diffsum-config` to configure your API key.');
