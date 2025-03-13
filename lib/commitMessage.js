import simpleGit from 'simple-git';
import fs from 'fs';
import OpenAI from 'openai';

// OpenAI API key (This will be replaced by setup.js)
const openai = new OpenAI({
  apiKey: 'YOUR_API_KEY_HERE', // Placeholder, will be replaced by setup.js
});

const git = simpleGit();

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
      return 'Mr. Gpt has failed to write a message for you.';
    });
}

// Function to replace the commit message
function setCommitMessage(commitMsgFile) {
  // Read existing commit message (if any)
  let existingMessage = fs
    .readFileSync(commitMsgFile, 'utf-8')
    .split('\n') // Split into lines
    .filter((line) => !line.startsWith('#')) // Remove comments
    .map((line) => line.trim()) // Trim spaces
    .filter((line) => line.length > 0) // Remove empty lines
    .join('\n'); // Rejoin into a string

  // If the user provided a commit message, skip AI-generated message
  if (existingMessage.length > 0) {
    console.log(
      '(┬┬﹏┬┬) User-provided commit message detected. Skipping AI suggestion.'
    );
    return;
  }

  getGitDiff()
    .then((diff) => generateCommitMessage(diff))
    .then((commitMsg) => {
      fs.writeFileSync(commitMsgFile, commitMsg, { encoding: 'utf-8' });
    })
    .catch((error) => {
      console.error('`(*>﹏<*)′ Error setting commit message:', error);
    });
}

// Run commit message function
setCommitMessage(process.argv[2]);
