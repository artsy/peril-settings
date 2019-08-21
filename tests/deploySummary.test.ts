jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

dm.markdown = (message: string) => message

import { deploySummary } from "../org/allPRs"

it("outputs associated PR info", async () => {
  dm.danger = {
    github: {
      pr: {
        base: {
          ref: "release",
        },
      },
      commits: [
        {
          sha: "sha",
        },
      ],
      thisPR: {
        title: "This awesome PR",
        repo: "force",
        owner: "artsy",
        body: "",
        base: {
          user: {
            login: "orta",
          },
          repo: {
            name: "danger-js",
            html_url: "http://my_url.com",
          },
        },
        number: 23,
      },
      api: {
        request: () => {
          return Promise.resolve({
            data: {
              data: {
                repository: {
                  sha_sha: {
                    associatedPullRequests: {
                      edges: [
                        {
                          node: {
                            title: "PR to be deployed",
                            url: "https://github.com/artsy/force/pull/1400",
                            number: 1400,
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          })
        },
      },
    },
  }

  const generatedSummary = await deploySummary()
  expect(generatedSummary).toContain("PR to be deployed (https://github.com/artsy/force/pull/1400)")
})
