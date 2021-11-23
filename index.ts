import * as core from '@actions/core';
import * as exec from '@actions/exec';

const getCommand = (step: number) => core.getInput(`$${step}`);

async function main() {
  try {
    let step = 0;
    let command = getCommand(step);
    while (command) {
      // eslint-disable-next-line no-await-in-loop
      await exec.getExecOutput(command, []);
      step += 1;
      command = getCommand(step);
    }
  } catch (error) {
    core.setFailed((error as Error).message);
  }
}

main();
