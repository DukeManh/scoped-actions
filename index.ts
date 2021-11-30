/* eslint-disable no-await-in-loop */
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import minimatch from 'minimatch';
import { ESLint } from 'eslint';

const getCommand = (step: number) => core.getInput(`s${step}`);

async function runPrettier(command: string, changedFiles: string[]) {
  await exec.getExecOutput(command, [...changedFiles, '--ignore-unknown']);
}

async function runLint(command: string, changedFiles: string[]) {
  const eslint = new ESLint();
  const files: string[] = [];
  const eslintTarget = core.getInput('eslintTarget');

  console.log(eslintTarget);
  for (let i = 0; i < changedFiles.length; i += 1) {
    const isIgnored =
      (await eslint.isPathIgnored(changedFiles[i])) ||
      (eslintTarget ? !minimatch(changedFiles[i], eslintTarget) : false);
    if (!isIgnored) {
      files.push(changedFiles[i]);
    }
  }

  if (files.length) {
    await exec.getExecOutput(command, files);
  } else {
    console.log('No files need linting');
  }
}

async function runTest(command: string, files: string[]) {
  const { stdout } = await exec.getExecOutput(
    "find . -type d -name node_modules -prune -o -name package.json -printf '%h\\n'"
  );

  const workspaces = stdout.split(/\n/);
  const changedWorkSpaces: string[] = [];
  files.forEach((file) => {
    let match = '';
    workspaces.forEach((ws) => {
      match = file.startsWith(ws) && ws.length > match.length ? ws : match;
    });
    if (match) {
      changedWorkSpaces.push(match);
    }
  });

  let errorDetected = false;

  // eslint-disable-next-line no-restricted-syntax
  for (const ws of changedWorkSpaces) {
    try {
      await exec.exec(command, [ws]);
    } catch {
      errorDetected = true;
    }
  }

  if (errorDetected) {
    throw new Error('Run test failed');
  }
}

async function main() {
  try {
    const changedFiles = core.getInput('files').split(',');
    console.log(`Changed files: ${changedFiles}`);

    let step = 0;
    let command = getCommand(step);

    while (command) {
      if (command.match(/prettier/)) {
        await runPrettier(command, changedFiles);
      } else if (command.match(/(eslint|lint)/)) {
        await runLint(command, changedFiles);
      } else if (command.match(/(jest|test)/)) {
        await runTest(command, changedFiles);
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
