#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

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
  console.warn('(╬▔皿▔)╯ No Git repository detected. Please run this inside a Git project.');
  process.exit(1);
} else {
  console.log('(´▽`ʃ♡ƪ) Found Git root at: ', gitRoot);
}

// Interactive check
const isInteractive = () => process.stdout.isTTY && process.stdin.isTTY;

if (!isInteractive()) {
  console.log('ㄟ( ▔, ▔ )ㄏ Non-interactive mode detected. Please create a .env file manually.');
  console.log(`Example:\n  echo 'OPENAI_API_KEY=your_api_key_here' > ${path.join(gitRoot, '.env')}`);
  process.exit(0);
}

// Prompt for API key
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

rl.question('Enter your OpenAI API key: ', (apiKey) => {
  if (!apiKey.trim()) {
    console.log('＞︿＜ No API key provided. Skipping .env setup.');
  } else {
    const envPath = path.join(gitRoot, '.env');
    fs.writeFileSync(envPath, `OPENAI_API_KEY=${apiKey}\n`, { encoding: 'utf-8' });
    console.log(`（￣︶￣）↗　 .env file created at: ${envPath}`);
  }
  rl.close();
});
