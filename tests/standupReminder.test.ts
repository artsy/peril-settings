import { calendar_v3 } from "googleapis"

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

import { sendMessageForEvents } from "../tasks/standupReminder"

const today = "2019-01-07"
const events = [
  {
    // One event that starts today.
    start: { date: today },
    end: { date: "2019-01-14" },
    attendees: [{ email: "ash@example.com" }],
  },
  {
    // One event that spans today.
    start: { date: "2019-01-02" },
    end: { date: "2019-01-09" },
    attendees: [{ email: "orta@example.com" }],
  },
  {
    // And one event that ends today.
    start: { date: "2018-12-31" },
    end: { date: today },
    attendees: [{ email: "eloy@example.com" }],
  },
] as calendar_v3.Schema$Event[]

describe("Monday standup reminders", () => {
  beforeEach(() => {
    console.log = jest.fn()
  })

  it("sends a message", async () => {
    await sendMessageForEvents([])
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

    it("looks up attendees on slack and mentions them", async () => {
      var receivedMessage
      mockSlackDevChannel.mockImplementation(message => (receivedMessage = message))
      await sendMessageForEvents(events, new Date(today))
      expect(receivedMessage).toEqual(
        "<@ASHID>, <@ORTAID> it looks like you are on-call this week, so you’ll be running the Monday standup at 11:30 NYC time. Here are the docs: https://github.com/artsy/README/blob/master/events/open-standup.md"
      )
    })

    it("skips failed email lookups", async () => {
      events[1].attendees = [{ email: "unknown@user.com" }]
      var receivedMessage
      mockSlackDevChannel.mockImplementation(message => (receivedMessage = message))
      await sendMessageForEvents(events, new Date(today))
      expect(receivedMessage).toEqual(
        "<@ASHID> it looks like you are on-call this week, so you’ll be running the Monday standup at 11:30 NYC time. Here are the docs: https://github.com/artsy/README/blob/master/events/open-standup.md"
      )
    })
  })
})
