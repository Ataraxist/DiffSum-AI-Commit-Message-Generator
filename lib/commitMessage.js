import simpleGit from 'simple-git';
import fs from 'fs';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, 'config.json');

// OpenAI API key (This will be replaced by setup.js)
const openai = new OpenAI({
  apiKey: 'PLACEHOLDER',
});

const git = simpleGit();

// Load config to check if verbose mode is enabled
const loadConfig = () => {
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    return { verbose: false };
  }
};

const config = loadConfig();
const model = config.verbose ? config.models.verbose : config.models.concise;
const systemMessage = config.verbose ? config.messages.verbose : config.messages.concise;
const maxTokens = config.verbose? config.maxTokens.verbose : config.maxTokens.concise;

// Function to grab the difference between commits.
async function getGitDiff() {
  return git
    .diff(['--staged'])
    .then((diff) => diff || '') // Ensure it always returns a string
    .catch((error) => {
      console.error('(╯‵□′)╯︵┻━┻ I cant find a git diff file: ', error);
      return ''; // Always return a string
    });
}

// Function to send the difference to OpenAI and generate a commit message.
async function generateCommitMessage(diff) {
  if (!diff.trim()) {
    return '(⊙_⊙)？I can\'t find a difference in your commit...';
  }

  return openai.chat.completions
  .create({
    model: model,
    temperature: 0.3,
    top_p: 0.9,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: `Write a commit message for this Git diff:\n\n${diff}` },
    ],
  })
  .then((response) => response.choices[0].message.content.trim())
  .catch((error) => {
    console.error('Error generating commit message:', error);
    return `Unable to AI Generate commit:\n\n ${error}`;
  });
}

// Function to replace the commit message
function setCommitMessage(commitMsgFile) {
  const lines = fs.readFileSync(commitMsgFile, 'utf-8').split('\n');

  const userMessage = lines
    .filter((line) => !line.startsWith('#'))
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');

  const gitComments = lines.filter((line) => line.startsWith('#')).join('\n');

  if (userMessage.length > 0) {
    console.log(
      '(┬┬﹏┬┬) User-provided commit message detected. Skipping AI suggestion.'
    );
    return;
  }

  getGitDiff()
    .then((diff) => generateCommitMessage(diff))
    .then((commitMsg) => {
      const finalMessage = `${commitMsg}\n\n${gitComments}`.trim();
      fs.writeFileSync(commitMsgFile, finalMessage, { encoding: 'utf-8' });
    })
    .catch((error) => {
      console.error('`(*>﹏<*)′ Error setting commit message:', error);
    });
}

// Run commit message function
setCommitMessage(process.argv[2]);
