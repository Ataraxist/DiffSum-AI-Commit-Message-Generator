import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Resolve the directory of this script
const scriptDir = path.dirname(fileURLToPath(import.meta.url));

// Function to find the Git root directory
const findGitRoot = (dir) => {
  if (fs.existsSync(path.join(dir, '.git'))) return dir;
  const parent = path.dirname(dir);
  return parent !== dir ? findGitRoot(parent) : null;
};

// Locate the Git root
const gitRoot = findGitRoot(process.cwd());

if (!gitRoot) {
  console.warn(
    '⚠️  No Git repository detected. Skipping Git hook installation.'
  );
  process.exit(0);
} else {
  console.log(`✅ Found Git root at: ${gitRoot}`);
}

// Define correct paths using gitRoot
const hooksDir = path.join(gitRoot, '.git', 'hooks');
const hookFile = path.join(hooksDir, 'prepare-commit-msg');
const sourceFile = path.join(scriptDir, 'bin', 'prepare-commit-msg'); // Uses `scriptDir` for ESM compatibility

// Ensure the .git/hooks directory exists
fs.mkdirSync(hooksDir, { recursive: true });

// Attempt to create the git hook
try {
  fs.copyFileSync(sourceFile, hookFile);
  fs.chmodSync(hookFile, 0o755); // Make executable
  console.log('✅ Git hook installed successfully!');
} catch (error) {
  console.error('❌ Error installing Git hook:', error);
  process.exit(1);
}

// Detect interactive mode
const isInteractive = () => process.stdout.isTTY && process.stdin.isTTY;

// Function to detect if this is running in an npm install process
function isNpmInstall() {
  return process.env.npm_config_user_agent !== undefined;
}

// Only prompt for API key if it's an interactive shell AND not running in an install process
if (isInteractive() && !isNpmInstall()) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  rl.question('Enter your OpenAI API key: ', (apiKey) => {
    if (!apiKey.trim()) {
      console.log('❌ No API key provided. Skipping .env setup.');
    } else {
      const envPath = path.join(gitRoot, '.env');
      fs.writeFileSync(envPath, `OPENAI_API_KEY=${apiKey}\n`, {
        encoding: 'utf-8',
      });
      console.log(`✅ .env file created at: ${envPath}`);
    }
    rl.close();
  });
} else {
  console.log(
    '⚠️  Non-interactive install detected. Please create a .env file manually.'
  );
  console.log(
    `Example:\n  echo 'OPENAI_API_KEY=your_api_key_here' > ${path.join(
      gitRoot,
      '.env'
    )}`
  );
}
