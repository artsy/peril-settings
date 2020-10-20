jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import { rfc327 } from "../org/rfc_327"

describe("rfc327", () => {
  beforeEach(() => {
    dm.danger = {
      github: {
        pr: {
          title: "",
        },
      },
    }
    dm.markdown = jest.fn()
  })

  describe("when a PR title matches semantic formatting", () => {
    it("does nothing", async () => {
      dm.danger.github.pr.title = "feat: add awesome new feature"
      await rfc327()
      expect(dm.markdown).not.toHaveBeenCalled()

      // Includes optional scope
      dm.danger.github.pr.title = "fix(scope): add awesome new feature"
      await rfc327()
      expect(dm.markdown).not.toHaveBeenCalled()

      // Accepts breaking change signifier
      dm.danger.github.pr.title = "chore!: some breaking change"
      await rfc327()
      expect(dm.markdown).not.toHaveBeenCalled()
    })
  })

  describe("when a PR title does not match semantic formatting", () => {
    it("warns the PR author and links to the RFC", async () => {
      dm.danger.github.pr.title = "Does not match semantic formatting"
      await rfc327()
      expect(dm.markdown).toHaveBeenCalled()
    })
  })
})
