# Boilerplate for Node Libraries

This is the boilerplate to create Node libraries.


## Configuration Steps

Follow:

- configure the **tmuxinator profile** and install it;

- initialise **Git** and **Git Flow**;

- configure **package.json** and make initial install.


## Publishing Workflow

Steps:

- update package **README.md** and the description at **package.json**, if applicable;

- check for **console.log("D:** left behind;

- test **npm run build** or **npm run build-with-docs** (better the last one, copy resulting docs to mlk-docs);

- test **npm pack**;

- review changes with Git to get a clear idea of changes in the current version, but don't commit yet;

- test **npm publish**, changing version with **npm version** if needed. Start new projects always at **version 1.0.0** and start working on it at the fix number no matter what the changes are. **0 or odd** minor versions means developing versions, never go out of that until it is considered stable, at which point move to an **even** minor version number and make fixes to that. Only change major version changes on truly backward incompatible changes. **LET THE CODE MATURE BEFORE COMITTING EVEN VERSION NUMBERS**;

- close the Git Flow feature and go back to **develop**, if any. Get a clear idea of changes in the current version;

- if applicable, create a new Git Flow Release;

- push all branches and tags to GitLab:

```Shell
# This will push ALL branches to origin, even the non-existant ones. Remove sporious branches with git push origin :branch_name
git push --all origin
git push --tags
git fetch -av --prune
git branch -av
```

- create a new Release at GitLab from the last **master**. Set **Tag name** and **Release title** to **vX.X.X**.
