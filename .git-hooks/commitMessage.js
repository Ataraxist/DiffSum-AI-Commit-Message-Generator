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
      temperature: 0.3,
      top_p: 0.9,
      messages: [
        {
          role: 'system',
          content: `
            You are an AI that writes Git commit messages in a structured format.
            Follow these rules:
            
            1. **Subject (First Line)**
              - Use Conventional Commits format (e.g., feat:, fix:, chore:).
              - Keep it under 72 characters.
              - Use the imperative mood (e.g., "Add feature" instead of "Added feature").
              - Clearly describe what the change does.
            
            2. **Body (Optional, After a Blank Line)**
              - Add additional context if necessary.
              - Explain why the change was made.
              - Use bullet points for clarity if listing multiple changes.
              - Wrap lines at 80 characters.

            **Example Format:**
            feat: improve login validation

            - Ensure password length validation matches frontend policy.
            - Improve error messages for incorrect login attempts.
            - Refactor validation logic for reusability.
          `,
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
  // im trying to see if I can get this thing to only commit when there is no user supplied message
  let existingMessage = fs
    .readFileSync(commitMsgFile, 'utf-8') // Open the commit message
    .split('\n') // Split it into lines
    .filter((line) => !line.startsWith('#')) // Remove all of the comment lines
    .map((line) => line.trim()) // Trim each line of their spaces
    .filter((line) => line.length > 0) // Remove empty lines without content
    .join('\n'); // Rejoin into a string

  if (existingMessage.length > 0) {
    console.log(
      '(┬┬﹏┬┬) User-provided commit message detected. Skipping AI suggestion.'
    );
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
