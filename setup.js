import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';

// Function to find the Git root directory
function findGitRoot(dir) {
  if (fs.existsSync(path.join(dir, '.git'))) {
    return dir;
  }
  const parent = path.dirname(dir);
  if (parent === dir) return null; 
  return findGitRoot(parent);
}

// Locate the Git root
const gitRoot = findGitRoot(process.cwd());

if (!gitRoot) {
  console.warn("⚠️  No Git repository detected. Skipping Git hook installation.");
  process.exit(0);
} else {
  console.log(`✅ Found Git root at: ${gitRoot}`);
}

// Define correct paths using gitRoot
const hooksDir = path.join(gitRoot, '.git', 'hooks');
const hookFile = path.join(hooksDir, 'prepare-commit-msg');
const sourceFile = path.join(__dirname, 'bin', 'prepare-commit-msg'); // Ensure source is found correctly

// Ensure the .git/hooks directory exists
fs.mkdirSync(hooksDir, { recursive: true });

// Attempt to create the git hook
try {
  fs.copyFileSync(sourceFile, hookFile);
  fs.chmodSync(hookFile, 0o755); // Equivalent to chmod +x
  console.log("✅ Git hook installed successfully!");
} catch (error) {
  console.error("❌ Error installing Git hook:", error);
  process.exit(1);
}

// Function to detect interactive mode
function isInteractive() {
  return process.stdout.isTTY && process.stdin.isTTY;
}

// Handle API key setup
if (isInteractive()) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question("Enter your OpenAI API key (with single quotes): ", (apiKey) => {
    if (!apiKey.trim()) {
      console.log("❌ No API key provided. Skipping .env setup.");
    } else {
      const envContent = `OPENAI_API_KEY=${apiKey}\n`;
      fs.writeFileSync(path.join(gitRoot, '.env'), envContent, { encoding: 'utf-8' }); // Save in Git root
      console.log("✅ .env file created successfully!");
    }
    rl.close();
  });
} else {
  console.log("⚠️  Non-interactive install detected. You need to manually create a .env file with your OpenAI API key.");
  console.log("Example:");
  console.log(`  echo 'OPENAI_API_KEY=your_api_key_here' > ${path.join(gitRoot, '.env')}`);
}
