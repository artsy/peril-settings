## Artsy Peril Settings

### What is this project?

This is the configuration repo for Peril on the Artsy org. There is a [settings file](settings.json) and org-wide
dangerfiles which are inside the [org folder](org).

Here's some links to the key things

-   [Peril](https://github.com/danger/peril)
-   [Danger JS](http://danger.systems/js/)
-   [Peril for Orgs](https://github.com/danger/peril/blob/master/docs/setup_for_org.md)
-   [Peril on the Artsy Heroku team](https://dashboard.heroku.com/apps/artsy-peril)

### TLDR on this Repo?

Peril is Danger running on a web-server, this repo is the configuration for that, currently the dangerfiles in [org](org/)
run on every issue and pull request for all our repos.

### To Develop

```sh
git clone https://github.com/artsy/artsy-danger.git
cd artsy-danger
yarn install
code .
```

You will need node and yarn installed beforehand. You can get them both by running `brew install yarn`.  This will give you auto-completion and types for Danger/Peril mainly. 

### RFCs

Any PR that adds a new rule at org-wide level to every repo should be treated as [an RFC](https://en.wikipedia.org/wiki/Request_for_Comments). Please make an issue with this template:

    Title: "RFC: Add a Markdown Spell Checker to all Markdown docs in PR" 

    ## Proposal: 

    Apply a spell checker to every markdown document that appears in a PR.

    ## Reasoning

    We want to have polished documents, both internally and externally. Having a spellcheck
    happening without any effort on a developers part means that we'll get a second look at
    any documentation improvements on any repo.

    ## Exceptions: 

    This won't be perfect, but it is better to get something working than to not have it at all.
    I added the ability to ignore files: so CHANGELOGs which tend to be really jargon heavy will
    be avoided in every repo.

    Other than that, we can continue to build up a global list of words to ignore.

Peril will [post a message](/danger/new_rfc.ts) in the #dev slack channel for everyone to see when you include `"RFC:"` in your issue title.

### Implementing an RFC

#### Adding a rule

A rule should be wrapped in an rfc closure:

```ts
// https://github.com/artsy/artsy-danger/issues/2
rfc("Keep our Markdown documents awesome", () => {
  // [...]
})
```

This self-documents where a rule has come from, making it easy for others to understand how we came to specific rules. The closure passed to `rfc` can be async as well.

#### Testing a rule

We use Jest to test our Dangerfiles. It uses the same techniques as testing a danger plugin where the  global imports from danger are fake.

1.  Create a file for your RFC: `tests/rfc_[x].test.ts`.
2.  Add a `before` and `after` setting up and resetting mocks:

    ```ts
    jest.mock("danger", () => jest.fn())
    import * as danger from "danger"
    const dm = (danger as any)

    beforeEach(() => {
      dm.danger = {}
      dm.fail = jest.fn() // as necessary
    })

    afterEach(() => {
      dm.fail = undefined
      dm.schedule = undefined
    })
    ```

3.  Set up your danger object and run the function exported in `all-prs.ts`: 

    ```ts
    import { rfcN } from "../org/all-prs"

    it("warns when there's there's no assignee and no WIP in the title", () => {
      dm.danger.github = { pr: { title: "Changes to the setup script", assignee: null }}
      return rfcN().then(() => {
        // [...]
      })
    })
    ```

4.  Validate that the `fail`/`warn`/`message`/`markdown` is called.
