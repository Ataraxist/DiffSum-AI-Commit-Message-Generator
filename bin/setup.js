import fs from 'fs';
import readline from 'readline';

// Function to prompt the user for input
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