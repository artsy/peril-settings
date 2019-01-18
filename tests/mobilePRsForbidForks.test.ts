jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import mobilePRsForbidForks from "../org/mobilePRsForbidForks"

describe("mobilePRsForbidForks", () => {
  beforeEach(() => {
    dm.danger = {
      github: {
        api: {
          orgs: {
            checkMembership: jest.fn(),
          },
        },
        pr: {
          user: {
            login: "some_user",
          },
          head: {
            repo: {},
          },
          base: {
            repo: {},
          },
        },
      },
    }
    dm.warn = jest.fn()
    dm.fail = jest.fn()
  })

  describe("on mobile repos", () => {
    beforeEach(() => {
      dm.danger.github.pr.base.repo.name = "eigen"
    })

    it("fails builds for Artsy staff on forks", async () => {
      ;(dm.danger.github.api.orgs.checkMembership as jest.Mock).mockImplementation(() => Promise.resolve())
      dm.danger.github.pr.head.repo.fork = true
      await mobilePRsForbidForks()
      expect(dm.fail).toHaveBeenCalled()
    })

    it("warns builds for OSS contributors on forks", async () => {
      ;(dm.danger.github.api.orgs.checkMembership as jest.Mock).mockRejectedValueOnce("some error")
      dm.danger.github.pr.head.repo.fork = true
      await mobilePRsForbidForks()
      expect(dm.warn).toHaveBeenCalled()
    })

    it("does nothing when submitted from a branch", async () => {
      ;(dm.danger.github.api.orgs.checkMembership as jest.Mock).mockImplementation(() => Promise.resolve())
      await mobilePRsForbidForks()
      expect(dm.fail).not.toHaveBeenCalled()
    })
  })

  describe("on non-mobile repos", () => {
    beforeEach(() => {
      dm.danger.github.pr.base.repo.name = "force"
    })

    it("does nothing", async () => {
      await mobilePRsForbidForks()
      expect(dm.fail).not.toHaveBeenCalled()
      expect(dm.warn).not.toHaveBeenCalled()
    })
  })
})
