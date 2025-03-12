import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Define paths
const hooksDir = path.join('.git', 'hooks');
const hookFile = path.join(hooksDir, 'prepare-commit-msg');
const sourceFile = path.join('bin', 'prepare-commit-msg');

// Check if this is a valid Git repository
if (!fs.existsSync('.git')) {
  console.warn("⚠️  No Git repository detected. Skipping Git hook installation.");
  process.exit(0);
}

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
      fs.writeFileSync('.env', envContent, { encoding: 'utf-8' });
      console.log("✅ .env file created successfully!");
    }
    rl.close();
  });
} else {
  console.log("⚠️  Non-interactive install detected. You need to manually create a .env file with your OpenAI API key.");
  console.log("Example:");
  console.log("  echo 'OPENAI_API_KEY=your_api_key_here' > .env");
}
