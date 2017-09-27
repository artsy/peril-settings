
const runtime: any = global
import { runDangerfile } from "./utils"

let invocations: number
beforeEach(() => {
  invocations = 0
  runtime.warn = jest.fn()
  runtime.danger = {}
  runtime.schedule = async (f: any) => { return await f() }
})

afterEach(() => {
  runtime.warn = undefined
  runtime.danger = undefined
  runtime.schedule = undefined
})

const callAfterInvocations = (retVal: any, done: any) => {
  return async () => {
    invocations++
    if (invocations >= 3) { 
      console.log("resuming", invocations)
      done() 
    }
    return retVal
  }
}

it("does nothing when there is no changelog file", (done) => {
  runtime.danger.github = { 
    utils: {
      fileContents: callAfterInvocations(null, done)
    }
  }
  runtime.danger.git = {
    modified_files: [],
    created_files: []
  }
  runDangerfile("./org/all-prs.ts")  
  expect(runtime.warn).not.toBeCalled()
})

it("does nothing when only `test` files were changed", (done) => {
  runtime.danger.github = { 
    utils: {
      fileContents: callAfterInvocations("some changes", done)
    }
  }
  runtime.danger.git = {
    modified_files: ["tests/AuctionCalculatorSpec.scala"],
    created_files: []
  }
  runDangerfile("./org/all-prs.ts")  
  expect(runtime.warn).not.toBeCalled()
})

it("does nothing when the changelog was changed", (done) => {
  runtime.danger.github = { 
    utils: {
      fileContents: callAfterInvocations("some changes", done)
    }
  }
  runtime.danger.git = {
    modified_files: ["src/index.html", "CHANGELOG.md"],
    created_files: []
  }
  runDangerfile("./org/all-prs.ts")  
  expect(runtime.warn).not.toBeCalled()
})

fit("warns when code has changed but no changelog entry was made", (done) => {
  runtime.danger.github = { 
    utils: {
      fileContents: () => Promise.resolve("some changes")
    }
  }
  let called = false
  
  runtime.warn = () => {
    called = true
    console.log("warning", done)
    done()
  }
  runtime.danger.git = {
    modified_files: ["src/index.html"],
    created_files: []
  }
  runDangerfile("./org/all-prs.ts")  
  expect(called).toBeTruthy()
})
