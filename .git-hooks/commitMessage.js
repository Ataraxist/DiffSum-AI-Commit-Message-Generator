import simpleGit from 'simple-git';
import fs from 'fs';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const git = simpleGit();

// function to grab the difference between commits.
async function getGitDiff() {
  return git
    .diff(['--staged'])
    .then((diff) => diff)
    .catch((error) => {
      console.error('Error getting git diff: ', error);
      return;
    });
}

// function to send the difference to chatGPT
async function generateCommitMessage(diff) {
  if (!diff.trim()) {
    return 'No Difference Detected.';
  }

  return openai.chat.completions
    .create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful AI that writes concise and descriptive Git commit messages.',
        },
        {
          role: 'user',
          content: `Write a commit message for this Git diff:\n\n${diff}`,
        },
      ],
    })
    .then((response) => response.choices[0].message.content.trim())
    .catch((error) => {
      console.error('Error generating commit message:', error);
      return 'chore: update project files';
    });
}

// function to replace the commit message
function setCommitMessage(commitMsgFile) {
  let existingMessage = fs.readFileSync(commitMsgFile, 'utf-8').trim();
  
  if (existingMessage.length > 0) {
    console.log("(┬┬﹏┬┬) User-provided commit message detected. Skipping AI suggestion.");
    return;
  }

  console.log('(づ￣ 3￣)づ Auto Generating a Commit Message.');

  getGitDiff()
    .then((diff) => generateCommitMessage(diff))
    .then((commitMsg) => {
      fs.writeFileSync(commitMsgFile, commitMsg, { encoding: 'utf-8' });
      console.log('(✿◡‿◡) Commit Message Generated:', commitMsg);
    })
    .catch((error) => {
      console.error('`(*>﹏<*)′ Error setting commit message:', error);
    });
}

setCommitMessage(process.argv[2]);
