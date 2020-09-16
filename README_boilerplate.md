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

- test **npm run build-with-docs** and copy the documentation to **mlk-docs**;

- test **npm pack**;

- test **npm publish**, changing version with **npm version** if needed;

- close the Git Flow feature and go back to **develop**, if any;

- if applicable, create a new Git Flow **Release** by the name **vX.X.X**;

- push all branches and tags to GitLab:

```Shell
# This will push ALL branches to origin, even the non-existant ones. Remove sporious branches with git push origin :branch_name
git push --all origin
git push --tags
git fetch -av --prune
git branch -av
```

- create a new Release at GitLab from the last **master**. Set **Tag name** and **Release title** to **vX.X.X**.
