# Contributing

## Environment setup

Contribute on Gitpod

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/DukeManh/scoped-actions)

## Testing Action locally with [Act](https://github.com/nektos/act)

Rebuilding source code after making changes

```
npm run build
```

Simulate a `push` event using `act`. The action will be run on the current repo.

Changed files come from comparing `before` and `after` commits specified in [act-payload.json](./act-payload.json).
Getting changed files require a GitHub `access token` to authenticate the OctoKit client.

```
act push -s GITHUB_TOKEN=<ACCESS_TOKEN> -e act-payload.json
```
