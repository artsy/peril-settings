jest.mock("danger", () => ({ peril: { runTask: jest.fn() } }))
import { peril } from "danger"

import check from "../danger/newRFC"

it("ignores issues which aren't RFCs", async () => {
  const issues: any = {
    issue: {
      title: "This awesome PR",
      html_url: "123",
      user: {
        login: "orta",
        avatar_url: "https://123.com",
      },
    },
  }

  await check(issues)

  expect(peril.runTask).not.toBeCalled()
})

it("Triggers tasks when RFC is in the title", async () => {
  const issues: any = {
    issue: {
      title: "[RFC] Let's make a change",
      html_url: "123",
      user: {
        login: "orta",
        avatar_url: "https://123.com",
      },
    },
  }

  await check(issues)

  expect(peril.runTask).toHaveBeenCalledWith("slack-dev-channel", "in 5 minutes", expect.anything())
  expect(peril.runTask).toHaveBeenCalledWith("slack-dev-channel", "in 3 days", expect.anything())
  expect(peril.runTask).toHaveBeenCalledWith("slack-dev-channel", "in 7 days", expect.anything())
})
