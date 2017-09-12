const runtime: any = global
import { runDangerfile } from "./utils"

beforeEach(() => {
  runtime.warn = jest.fn()
  runtime.danger = {}
})

afterEach(() => {
  runtime.warn = undefined
  runtime.danger = undefined
})

it("warns when there's there's no assignee and no WIP in the title", () => {
  runtime.danger.github = { pr: { title: "My Thing", assignee: null }}
  runDangerfile("./org/all-prs.ts")  
  expect(runtime.warn).toHaveBeenCalledWith("Please assign someone to merge this PR, and optionally include people who should review.")
})

it("does not warn when there's there's no assignee and WIP in the title", () => {
  runtime.danger.github = { pr: { title: "[WIP] My thing", assignee: null }}
  runDangerfile("./org/all-prs.ts")  
  expect(runtime.warn).not.toBeCalled()
})

it("does not warn when there's there's an assignee", () => {
  runtime.danger.github = { pr: { title: "My thing", assignee: {} }}
  runDangerfile("./org/all-prs.ts")  
  expect(runtime.warn).not.toBeCalled()
})
