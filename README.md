## Artsy Peril Settings

### What is this project?

This is the configuration repo for Peril on the Artsy org. There is a [settings file](settings.json) and org-wide
dangerfiles which are inside the [org folder](org).

Here's some links to the key things

 - [Peril](https://github.com/danger/peril)
 - [Danger JS](http://danger.systems/js/)
 - [Peril for Orgs](https://github.com/danger/peril/blob/master/docs/setup_for_org.md)
 - [Peril on the Artsy Heroku team](https://dashboard.heroku.com/apps/artsy-peril)

### TLDR on this Repo?

Peril is Danger running on a web-server, this repo is the configuration for that, currently the dangerfiles in [org](org/)
run on every issue and pull request for all our repos.

### To Develop

```sh
git clone https://github.com/artsy/artsy-danger.git
yarn install
code .
```

You will need node and yarn installed beforehand. You can get them both by running `brew install yarn`.  This will give you auto-completion and types for Danger/Peril mainly. 

### RFCs

Any PR that adds a new rule at org-wide level to every repo should be treated as [an RFC](https://en.wikipedia.org/wiki/Request_for_Comments). Please make an issue with this template:


    Title: "RFC: Add an emoji for when a node package is version bumped" 

    Proposal: If the repo has a `package.json`, we should look to see if its version has 
              changed and then submit a tada emoji.

    Reasoning: A release is important, we should chrish them.

    Exceptions: None
