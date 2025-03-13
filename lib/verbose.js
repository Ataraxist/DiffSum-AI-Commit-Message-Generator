import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, 'config.json');

// Load config
const loadConfig = () => {
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    return console.log('Seems like I cant find your config file, so... something is wrong in verbose.js in the diffsum node_module.');
  }
};

// Toggle verbose mode
const config = loadConfig();
config.verbose = !config.verbose;

// Save updated config
fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

console.log(
  config.verbose
    ? '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ Verbose mode ENABLED! Using GPT-4 for detailed commit messages.'
    : '(╯°□°）╯ Verbose mode DISABLED. Using GPT-3.5-turbo for quick commit messages.'
);
