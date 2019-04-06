jest.mock("danger", () => ({
  peril: { runTask: jest.fn() },
  danger: { github: { utils: { createOrAddLabel: jest.fn() } } },
}))
import { peril, danger } from "danger"

import retroActionItem from "../org/retroActionItems"

afterEach(() => {
  // @ts-ignore
  peril.runTask.mockReset()
  // @ts-ignore
  danger.github.utils.createOrAddLabel.mockReset()
})

it("ignores issues which aren't retro action items", async () => {
  const issues: any = {
    issue: {
      title: "Not Sharing some retro action items!",
      state: "open",
      html_url: "123",
      labels: [{ name: "random issue" }],
      user: {
        login: "orta",
        avatar_url: "https://123.com",
      },
    },
  }

  await retroActionItem(issues)

  expect(peril.runTask).not.toBeCalled()
  expect(danger.github.utils.createOrAddLabel).not.toBeCalled()
})

it("Triggers tasks when Retro Action Item is in the label", async () => {
  const issues: any = {
    repository: {
      owner: {
        login: "org",
      },
      name: "repo",
    },
    issue: {
      title: "Retro Action Item",
      html_url: "123",
      number: 123,
      labels: [{ name: "Retro Action Item" }],
      user: {
        login: "orta",
        avatar_url: "https://123.com",
      },
    },
  }

  await retroActionItem(issues)

  expect(peril.runTask).toHaveBeenCalledWith("slack-dev-channel", "in 5 minutes", expect.anything())
})
