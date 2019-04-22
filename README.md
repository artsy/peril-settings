## Artsy Peril Settings

### What is this project?

This is the configuration repo for Peril on the Artsy org. There is a [settings file](peril.settings.json) and org-wide
dangerfiles which are inside the [org folder](org/).

Here's some links to the key concepts:

- [Peril](https://github.com/danger/peril)
- [Danger JS](http://danger.systems/js/)
- [Peril for Orgs](https://github.com/danger/peril/blob/master/docs/setup_for_org.md)
- [Introducing Peril to the Artsy org](http://artsy.github.io/blog/2017/09/04/Introducing-Peril/)
- [Peril's Dashboard 🔐](https://staging-dashboard.peril.systems/)

An overview of what Peril does for Artsy is available in the README repo at [`/culture/peril.md`][docs].

### TL:DR on this Repo?

Peril is Danger running on a web-server, this repo is the configuration for that, currently the dangerfiles in [org](org/)
run on every issue and pull request for all our repos.

### To Develop

```sh
git clone https://github.com/artsy/peril-settings.git
cd peril-settings
yarn install
yarn jest
code .
```

You will need node and yarn installed beforehand. You can get them both by running `brew install yarn`. This will give
you auto-completion and types for Danger/Peril mainly.

### RFCs

It's likely that any time you want to make a change here you should consult the [Artsy RFC process](https://github.com/artsy/README/blob/master/playbooks/rfcs.md#readme) and apply it on [artsy/README](https://github.com/artsy/README/).

### Implementing an RFC

#### Adding a rule

A rule should include a link to its rfc:

```ts
// Keep our Markdown documents awesome
// https://github.com/artsy/peril-settings/issues/2
//
export default async (webhook: any) => {
  // [...]
})
```

This self-documents where a rule has come from, making it easy for others to understand how we came to specific rules.
The closure passed to `rfc` can be async as well.

#### Testing a rule

We use Jest to test our Dangerfiles. It uses the same techniques as testing a
[danger plugin](http://danger.systems/js/usage/extending-danger.html) where the global imports from danger are fake.

1.  Create a file for your RFC: `tests/rfc_[x].test.ts`.
2.  Add a `before` and `after` setting up and resetting mocks:

    ```ts
    jest.mock("danger", () => jest.fn())
    import * as danger from "danger"
    const dm = danger as any

    beforeEach(() => {
      dm.danger = {}
      dm.fail = jest.fn() // as necessary
    })

    afterEach(() => {
      dm.fail = undefined
    })
    ```

3.  Set up your danger object and run the function exported in `all-prs.ts`:

    ```ts
    import rfcN from "../org/all-prs"

    it("warns when there's there's no assignee and no WIP in the title", async () => {
      dm.danger.github = { pr: { title: "Changes to the setup script", assignee: null } }
      await rfcN()

      expect(something).toHappen()
        // [...]
      })
    })
    ```

4.  Validate that the `fail`/`warn`/`message`/`markdown` is called.

[docs]: https://github.com/artsy/README/blob/master/culture/peril.md
