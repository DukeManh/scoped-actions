/* eslint-disable no-await-in-loop */
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { ESLint } from 'eslint';

const getCommand = (step: number) => core.getInput(`s${step}`);

async function main() {
  try {
    let step = 0;
    let command = getCommand(step);
    const changedFiles = core.getInput('files').split(',');
    await exec.getExecOutput('pwd');
    while (command) {
      console.log(command);
      if (command.match(/prettier/)) {
        await exec.getExecOutput('npx prettier --check', [...changedFiles, '--ignore-unknown']);
      } else if (command.match(/(eslint|lint)/)) {
        const eslint = new ESLint();
        const files: string[] = [];
        for (let i = 0; i < changedFiles.length; i += 1) {
          const isIgnored = await eslint.isPathIgnored(changedFiles[i]);
          if (!isIgnored) {
            files.push(changedFiles[i]);
          }
        }
        console.log(files);
        await exec.getExecOutput('npm run lint', files);
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
