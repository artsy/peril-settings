jest.mock("danger", () => ({
  peril: { runTask: jest.fn() },
  danger: { github: { utils: { createOrAddLabel: jest.fn() } } },
}))
import { peril, danger } from "danger"

import addRFCLabel from "../org/rfc/addRFCToNewIssues"
import scheduleRFC from "../org/rfc/scheduleRFCsForLabels"

afterEach(() => {
  // @ts-ignore
  peril.runTask.mockReset()
  // @ts-ignore
  danger.github.utils.createOrAddLabel.mockReset()
})

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

  await addRFCLabel(issues)

  expect(peril.runTask).not.toBeCalled()
  expect(danger.github.utils.createOrAddLabel).not.toBeCalled()
})

it("Triggers tasks when RFC is in the title", async () => {
  const issues: any = {
    repository: {
      owner: {
        login: "org",
      },
      name: "repo",
    },
    issue: {
      title: "[RFC] Let's make a change",
      html_url: "123",
      number: 123,
      user: {
        login: "orta",
        avatar_url: "https://123.com",
      },
    },
  }

  await addRFCLabel(issues)

  expect(danger.github.utils.createOrAddLabel).toHaveBeenCalledWith(expect.anything(), {
    id: 123,
    owner: "org",
    repo: "repo",
  })
})

it("Triggers tasks when RFC is in the labels", async () => {
  const issues: any = {
    repository: {
      owner: {
        login: "org",
      },
      name: "repo",
    },
    issue: {
      title: "[RFC] Let's make a change",
      html_url: "123",
      number: 123,
      labels: [{ name: "RFC" }],
      user: {
        login: "orta",
        avatar_url: "https://123.com",
      },
    },
  }

  await scheduleRFC(issues)

  expect(peril.runTask).toHaveBeenCalledWith("slack-dev-channel", "in 5 minutes", expect.anything())
  expect(peril.runTask).toHaveBeenCalledWith("slack-dev-channel", "in 3 days", expect.anything())
  expect(peril.runTask).toHaveBeenCalledWith("slack-dev-channel", "in 7 days", expect.anything())
})

it("does not trigger tasks when RFC is not the labels", async () => {
  const issues: any = {
    repository: {
      owner: {
        login: "org",
      },
      name: "repo",
    },
    issue: {
      title: "[RCF] Let's make a change",
      html_url: "123",
      number: 123,
      labels: [],
      user: {
        login: "orta",
        avatar_url: "https://123.com",
      },
    },
  }

  await scheduleRFC(issues)

  expect(peril.runTask).not.toBeCalled()
})
