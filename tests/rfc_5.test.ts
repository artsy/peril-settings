const runtime: any = global
import { runDangerfile } from "./utils"

beforeEach(() => {
  runtime.fail = jest.fn()
  runtime.danger = {}
  runtime.schedule = () => {}
})

afterEach(() => {
  runtime.fail = undefined
  runtime.danger = undefined
})

it("fails when there's no PR body", () => {
  runtime.danger.github = { pr: { body: "" }}
  runDangerfile("./org/all-prs.ts")  
  expect(runtime.fail).toHaveBeenCalledWith("Please add a description to your PR.")
})

it("does nothing when there's a PR body", () => {
  runtime.danger.github = { pr: { body: "Hello world" }}
  runDangerfile("./org/all-prs.ts")  
  expect(runtime.fail).not.toBeCalled()
})
