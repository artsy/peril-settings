jest.mock("danger", () => ({
  danger: {
    github: {
      pr: {
        number: 12,
        base: {
          user: {
            login: "artsy",
          },
          repo: {
            name: "reaction",
          },
        },
      },
      api: {
        issues: {
          getLabels: jest.fn(),
          createLabel: jest.fn(),
          addLabels: jest.fn(),
        },
      },
      issue: {
        labels: ["Merge on Green"],
      },
    },
  },
}))

import { danger } from "danger"

const mockGetLabels: jest.Mock = danger.github.api.issues.getLabels as any
const mockCreateLabel: jest.Mock = danger.github.api.issues.createLabel as any
const mockAddLabels: jest.Mock = danger.github.api.issues.addLabels as any

import addPatchLabel, { labels } from "../repos/reaction/addPatchLabel"

afterEach(() => {
  mockGetLabels.mockReset()
  mockCreateLabel.mockReset()
  mockAddLabels.mockReset()
})

it("Does nothing if there's already a release label", async () => {
  danger.github.issue.labels = [{ name: "Version: Major" } as any]

  await addPatchLabel()

  expect(danger.github.api.issues.getLabels).not.toBeCalled()
})

it("Creates labels for this repo if there are no labels yet", async () => {
  // nothing on the issue
  danger.github.issue.labels = []
  // nothing set up in the repo yet
  mockGetLabels.mockResolvedValueOnce({ data: [] })

  await addPatchLabel()

  // adds the labels to the repo
  expect(mockCreateLabel).toBeCalledTimes(Object.keys(labels).length)
  // and adds the default
  expect(mockAddLabels).toBeCalled()
})

it("Posts a patch label if there are no labels already added", async () => {
  // nothing on the issue
  danger.github.issue.labels = []
  // the repo already has labels set up
  mockGetLabels.mockResolvedValueOnce({ data: [{ name: "Version: Patch" } as any] })

  await addPatchLabel()

  expect(mockCreateLabel).not.toBeCalled()
  expect(mockAddLabels).toBeCalled()
})
