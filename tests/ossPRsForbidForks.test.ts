jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import ossPRsForbidForks from "../org/ossPRsForbidForks"

describe("ossPRsForbidForks", () => {
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

  describe("on oss repos", () => {
    beforeEach(() => {
      dm.danger.github.pr.base.repo.name = "eigen"
    })

    it("fails builds for Artsy staff on forks", async () => {
      const mockCheckMembership: jest.Mock = dm.danger.github.api.orgs.checkMembership as any
      mockCheckMembership.mockImplementation(() => Promise.resolve())
      dm.danger.github.pr.head.repo.fork = true
      await ossPRsForbidForks()
      expect(dm.fail).toHaveBeenCalled()
    })

    it("warns builds for OSS contributors on forks", async () => {
      const mockCheckMembership: jest.Mock = dm.danger.github.api.orgs.checkMembership as any
      mockCheckMembership.mockRejectedValueOnce("some error")
      dm.danger.github.pr.head.repo.fork = true
      await ossPRsForbidForks()
      expect(dm.warn).toHaveBeenCalled()
    })

    it("does nothing when submitted from a branch", async () => {
      const mockCheckMembership: jest.Mock = dm.danger.github.api.orgs.checkMembership as any
      mockCheckMembership.mockImplementation(() => Promise.resolve())
      await ossPRsForbidForks()
      expect(dm.fail).not.toHaveBeenCalled()
    })
  })

  describe("on non-oss repos", () => {
    beforeEach(() => {
      dm.danger.github.pr.base.repo.name = "gravity"
    })

    it("does nothing", async () => {
      await ossPRsForbidForks()
      expect(dm.fail).not.toHaveBeenCalled()
      expect(dm.warn).not.toHaveBeenCalled()
    })
  })
})
