import simpleGit from 'simple-git'
import fs from 'fs'

const git = simpleGit();

async function getGitDifference() {
  return await git.diff(['--staged']).catch(error => {console.error('Error getting git diff: ', error)})
}

getGitDifference().then(diff => {
  console.log("Git Diff:\n", diff)
})