#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Resolve script directory
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const commitMessageFile = path.join(scriptDir, '../lib/commitMessage.js'); // Adjust path based on your structure

// Function to prompt user for API key
const askForApiKey = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Enter your OpenAI API key: ', (apiKey) => {
      rl.close();
      resolve(apiKey.trim().replace(/^['"]+|['"]+$/g, '')); // Remove any surrounding quotes
    });
  });
};

// Function to update commitMessage.js with API key
const updateCommitMessageFile = async () => {
  const apiKey = await askForApiKey();

  if (!apiKey) {
    console.log('⚠️ No API key provided. Skipping setup.');
    return;
  }

  if (!fs.existsSync(commitMessageFile)) {
    console.error(`❌ Error: ${commitMessageFile} not found.`);
    process.exit(1);
  }

  // Read commitMessage.js content
  let fileContent = fs.readFileSync(commitMessageFile, 'utf8');

  // Replace existing API key if it exists, otherwise add it
  if (fileContent.includes('OPENAI_API_KEY')) {
    fileContent = fileContent.replace(/apiKey:\s*['"].*?['"]/g, `apiKey: '${apiKey}'`);
  } else {
    fileContent = fileContent.replace(
      "const openai = new OpenAI({",
      `const openai = new OpenAI({\n  apiKey: '${apiKey}',`
    );
  }

  // Write updated content back to commitMessage.js
  fs.writeFileSync(commitMessageFile, fileContent, 'utf8');
  console.log(`✅ API key saved inside ${commitMessageFile}.`);
};

// Run update
updateCommitMessageFile().then(() => {
  console.log('✅ Setup complete! Run `git commit` to start using diffsum.');
});
