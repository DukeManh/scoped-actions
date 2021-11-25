import * as core from '@actions/core';
import { context } from '@actions/github';
import * as exec from '@actions/exec';

const getCommand = (step: number) => core.getInput(`s${step}`);

async function main() {
  try {
    let step = 0;
    let command = getCommand(step);
    const changedFiles = core.getInput('files');
    console.log(changedFiles);
    while (command) {
      // eslint-disable-next-line no-await-in-loop
      await exec.getExecOutput(command, []);
      step += 1;
      command = getCommand(step);
    }
    console.log(context?.payload.after);
  } catch (error) {
    core.setFailed((error as Error).message);
  }
}

main();
