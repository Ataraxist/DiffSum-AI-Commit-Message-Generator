import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import readline from 'readline';

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

// Function to prompt user for API key
const askForApiKey = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Enter your OpenAI API key: ', (apiKey) => {
      rl.close();
      resolve(apiKey.trim());
    });
  });
};

// Store API key in Git global config
const setupApiKey = async () => {
  const apiKey = await askForApiKey();

  if (!apiKey) {
    console.log('⚠️ No API key provided. Skipping setup.');
    return;
  }

  execSync(`git config --global diffsum.openai_key "${apiKey}"`);
  console.log('✅ API key saved to Git config.');
};

// Run API key setup
setupApiKey().then(() => {
  console.log('✅ Setup complete! Run `git commit` to start using diffsum.');
});
