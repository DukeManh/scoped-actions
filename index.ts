/* eslint-disable no-await-in-loop */
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import minimatch from 'minimatch';
import { ESLint } from 'eslint';

const getCommand = (step: number) => core.getInput(`s${step}`);

async function runPrettier(command: string, changedFiles: string[]) {
  await exec.getExecOutput(command, ['--', '--ignore-unknown', ...changedFiles]);
}

async function runLint(command: string, changedFiles: string[]) {
  const eslint = new ESLint();
  const files: string[] = [];
  const eslintTarget = core.getInput('eslintTarget');

  for (let i = 0; i < changedFiles.length; i += 1) {
    const isIgnored =
      (await eslint.isPathIgnored(changedFiles[i])) ||
      (eslintTarget && !minimatch(changedFiles[i], eslintTarget));
    if (!isIgnored) {
      files.push(changedFiles[i]);
    }
  }

  if (files.length) {
    await exec.exec(command, files);
  } else {
    console.log('No files need linting');
  }
}

async function runTest(command: string, changedFiles: string[]) {
  const { stdout } = await exec.getExecOutput(
    "find . -type d -name node_modules -prune -o -name package.json -printf '%h\\n'"
  );

  const workspaceList = stdout.split(/\n/);

  const workspaces: {
    [path: string]: {
      needTest: boolean;
      subWorkspaces: string[];
    };
  } = {};

  workspaceList.forEach((ws) => {
    workspaces[ws] = {
      needTest: false,
      subWorkspaces: [],
    };
  });

  workspaceList.forEach((ws) => {
    workspaceList.forEach((ws1) => {
      if (ws !== ws1 && ws1.startsWith(ws)) {
        workspaces[ws].subWorkspaces.push(ws1);
      }
    });
  });

  changedFiles.forEach((file) => {
    let parent = '';

    Object.keys(workspaces).forEach((ws) => {
      if (file.startsWith(ws) && parent.length < ws.length) {
        parent = ws;
      }
    });

    if (parent) {
      workspaces[parent].needTest = true;
      workspaces[parent].subWorkspaces.forEach((ws) => {
        delete workspaces[ws];
      });
    }
  });

  const testPattern = workspaceList.filter((ws) => workspaces[ws]?.needTest);

  await exec.exec(command, testPattern);
}

async function main() {
  try {
    const changedFiles = core.getInput('files').split(',');
    console.log(`Changed files: ${changedFiles}`);

    let step = 0;
    let command = getCommand(step);

    while (command) {
      command = command.trim().replace(/\s+/g, ' ');
      if (command.match(/\bprettier\b/)) {
        await runPrettier(command, changedFiles);
      } else if (command.match(/\b(eslint|lint)\b/)) {
        await runLint(command, changedFiles);
      } else if (command.match(/\b(test|tst|jest)\b/)) {
        await runTest(command, changedFiles);
      } else {
        await exec.exec(command);
      }
      step += 1;
      command = getCommand(step);
    }
  } catch (error) {
    core.setFailed((error as Error).message);
  }
}

main();
