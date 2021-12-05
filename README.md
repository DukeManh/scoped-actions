# Scoped Actions

`Scoped-actions` is a `GitHub Action` to run commands on only changed files or changed workspaces of a Node project.

Pass any commands to be executed, when a command is one of the following, extra arguments are appended to make sure the commands only run on changed files or changed workspaces.

#### Commands:

- `lint | eslint`: Run lint tool on changed and added files
- `prettier`: Run prettier on changed and added files
- `test | jest`: Run test on changed workspaces of a monorepo

## Inputs

### `files`

**Required**: Changed and added files

```yml
files: ${{ steps.files.outputs.added_modified}}
```

This action uses [jitterbit/get-changed-files](https://github.com/marketplace/actions/get-all-changed-files) to get changed and added files of a push or pull request.

```yml
- id: files
  uses: jitterbit/get-changed-files@v1
  with:
    format: csv
    token: ${{ github.token }}
```

### `s<n>`

Commands to be run in order, e.g:

```yml
s0: 'npm install'
s1: 'npm run prettier-check'
s2: 'npm run lint'
s3: 'npm run test'
```

# Example Usage

NOTE: Because extra arguments and options need to be appended to given commands, make sure your `package.json` scripts don't end with a double dash `--`.

```yml
on: [push, pull_request]

jobs:
run-test:
runs-on: ubuntu-latest
name: Run test, lint tool, code formatter on changed files and workspaces
steps:
  - name: Checkout
    uses: actions/checkout@v2

  - id: files
    uses: jitterbit/get-changed-files@v1
    with:
      format: csv
      token: ${{ github.token }}
  - name: Run scoped actions
    uses: DukeManh/scoped-actions@v1
    with:
      files: ${{ steps.files.outputs.added_modified}}
      eslintTarget: '**/*.{jsx,tsx,ts,js}'
      s0: 'npm install'
      s1: 'npm run prettier-check'
      s2: 'npm run lint'
      s3: 'npm run test'
```
