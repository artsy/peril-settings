jest.mock("danger", () => jest.fn())
import * as danger from "danger"
import { getJiraTicketIDsFromText } from "../org/jira/pr-updated"
const dm = danger as any

describe("grabbing links", () => {
  it("handles small references aka ABC-123", () => {
    const body = "ok ABC-123 sure"
    expect(getJiraTicketIDsFromText(body)).toEqual(["ABC-123"])
  })

  it("handles url references", () => {
    const body = "ok https://artsyproduct.atlassian.net/browse/PLATFORM-46 sure"
    expect(getJiraTicketIDsFromText(body)).toEqual(["PLATFORM-46"])
  })

  it("handles both url references and shorthand", () => {
    const body = "ok I fixed DAN-145 and https://artsyproduct.atlassian.net/browse/PLATFORM-46 sure"
    expect(getJiraTicketIDsFromText(body)).toEqual(["DAN-145", "PLATFORM-46"])
  })
})
