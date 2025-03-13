import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve script directory
const scriptDir = path.dirname(fileURLToPath(import.meta.url));

// Find Git root directory (assume the script is running inside the repo)
const findGitRoot = (dir) => {
  return fs.existsSync(path.join(dir, '.git')) ? dir : findGitRoot(path.dirname(dir));
};

const gitRoot = findGitRoot(process.cwd());

// Define hook paths
const hooksDir = path.join(gitRoot, '.git', 'hooks');
const hookFile = path.join(hooksDir, 'prepare-commit-msg');
const sourceFile = path.join(scriptDir, 'prepare-commit-msg');

// Ensure .git/hooks exists and copy the hook
fs.mkdirSync(hooksDir, { recursive: true });
fs.copyFileSync(sourceFile, hookFile);
fs.chmodSync(hookFile, 0o755);


// Done
console.log('(￣y▽￣)╭ Ohohoho..... Just a heads up, you need an OPENAI_API_KEY in your .env for this to work.');
