/* eslint-disable no-await-in-loop */
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { ESLint } from 'eslint';

const getCommand = (step: number) => core.getInput(`s${step}`);

async function runPrettier(command: string, changedFiles: string[]) {
  await exec.getExecOutput(command, [...changedFiles, '--ignore-unknown']);
}

async function runLint(command: string, changedFiles: string[]) {
  const eslint = new ESLint();
  const files: string[] = [];

  for (let i = 0; i < changedFiles.length; i += 1) {
    const isIgnored = await eslint.isPathIgnored(changedFiles[i]);
    if (!isIgnored) {
      files.push(changedFiles[i]);
    }
  }

  await exec.getExecOutput(command, files);
}

// async function runTest(command: string, files: string[]) {
//   await exec.getExecOutput('npx prettier --check', [...files, '--ignore-unknown']);
// }

async function main() {
  try {
    let step = 0;
    let command = getCommand(step);
    const changedFiles = core.getInput('files').split(',');
    await exec.getExecOutput('pwd');
    while (command) {
      console.log(command);
      if (command.match(/prettier/)) {
        runPrettier(command, changedFiles);
      } else if (command.match(/(eslint|lint)/)) {
        runLint(command, changedFiles);
      } else {
        await exec.getExecOutput(command, []);
      }
      step += 1;
      command = getCommand(step);
    }
  } catch (error) {
    core.setFailed((error as Error).message);
  }
}

main();
