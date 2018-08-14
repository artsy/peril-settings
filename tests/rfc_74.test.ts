jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any
import { getJiraTicketIDsFromText, getJiraTicketIDsFromCommits } from "../org/jira/utils"

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

  it("gets them out of the commits in danger", () => {
    const commits = [
      {
        message: "OK PLAT-123 fixed",
      },
      {
        message: "bah, broke",
      },
      {
        message: "Also did PLAT-124",
      },
      {
        message: "[DAN-32] Got some stuff",
      },
    ]

    expect(getJiraTicketIDsFromCommits(commits)).toEqual(["PLAT-123", "PLAT-124", "DAN-32"])
  })
})
