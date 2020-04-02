jest.mock("danger", () => ({
  peril: {
    env: {},
  },
}))

const mockSlackDevChannel = jest.fn()
jest.mock("../tasks/slackDevChannel", () => ({
  slackMessage: mockSlackDevChannel,
}))

const mockLookupByEmail = jest.fn()
jest.mock("@slack/client", () => ({
  WebClient: jest.fn().mockImplementation(() => ({
    users: {
      lookupByEmail: mockLookupByEmail,
    },
  })),
}))

const mockSuccessResponse = {
  data: {
    onCallParticipants: [
      {
        name: "orta@example.com",
      },
      {
        name: "ash@example.com",
      },
    ],
  },
}
const mockJsonPromise = Promise.resolve(mockSuccessResponse)
const mockFetchPromise = Promise.resolve({
  json: () => mockJsonPromise,
})

jest.mock("node-fetch", () => {
  return {
    default: () => mockFetchPromise,
  }
})

import { sendMessageForEmails, emailsFromOpsGenie } from "../tasks/standupReminder"

const today = "2019-01-07"

describe("Monday standup reminders", () => {
  beforeEach(() => {
    console.log = jest.fn()
  })

  it("sends a message", async () => {
    await sendMessageForEmails([])
    expect(mockSlackDevChannel).toHaveBeenCalled()
  })

  describe("with mocked email lookup", () => {
    beforeEach(() => {
      mockLookupByEmail.mockImplementation(async obj => {
        if (obj.email.startsWith("ash@")) {
          return { ok: true, user: { id: "ASHID" } }
        } else if (obj.email.startsWith("orta@")) {
          return { ok: true, user: { id: "ORTAID" } }
        } else {
          return { ok: false }
        }
      })
    })

    it("fetches on-call participants from OpsGenie", async () => {
      var receivedMessage
      mockSlackDevChannel.mockImplementation(message => (receivedMessage = message))

      const emails = await emailsFromOpsGenie(new Date(today))

      await sendMessageForEmails(emails)
      expect(receivedMessage).toMatchInlineSnapshot(
        `"<@ORTAID>, <@ASHID> based on our on-call schedule, you’ll be running the Monday standup at 11:30 NYC time. Here are the docs: https://github.com/artsy/README/blob/master/events/open-standup.md Add new standup notes here: https://www.notion.so/artsy/Standup-Notes-28a5dfe4864645788de1ef936f39687c"`
      )
    })
  })

  describe("with failed email lookup", () => {
    beforeEach(() => {
      mockLookupByEmail.mockImplementation(async obj => {
        if (obj.email.startsWith("ash@")) {
          return { ok: true, user: { id: "ASHID" } }
        } else {
          return { ok: false }
        }
      })
    })

    it("skips failed email lookups", async () => {
      var receivedMessage
      mockSlackDevChannel.mockImplementation(message => (receivedMessage = message))

      const emails = await emailsFromOpsGenie(new Date(today))

      await sendMessageForEmails(emails)
      expect(receivedMessage).toMatchInlineSnapshot(
        `"<@ASHID> based on our on-call schedule, you’ll be running the Monday standup at 11:30 NYC time. Here are the docs: https://github.com/artsy/README/blob/master/events/open-standup.md Add new standup notes here: https://www.notion.so/artsy/Standup-Notes-28a5dfe4864645788de1ef936f39687c"`
      )
    })
  })
})
