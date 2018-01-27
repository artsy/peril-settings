jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import { rfc16 } from "../org/all-prs"

beforeEach(() => {
  dm.danger = {}
  dm.warn = jest.fn()
})

const pr = {
  head: {
    user: {
      login: "danger",
    },
    repo: {
      name: "danger-js",
    },
  },
  state: "open",
}

it("warns when code has changed but no changelog entry was made", () => {
  dm.danger.github = {
    api: {
      gitdata: {
        getTree: () => Promise.resolve({ data: { tree: [{ path: "code.js" }, { path: "CHANGELOG.md" }] } }),
      },
    },
    pr,
  }
  dm.danger.git = {
    modified_files: ["src/index.html"],
    created_files: [],
  }
  return rfc16().then(() => {
    expect(dm.warn).toBeCalled()
  })
})

it("does nothing when there is no changelog file", () => {
  dm.danger.github = {
    api: {
      gitdata: {
        getTree: () => Promise.resolve({ data: { tree: [{ path: "code.js" }] } }),
      },
    },
    pr,
  }
  dm.danger.git = {
    modified_files: [],
    created_files: [],
  }
  return rfc16().then(() => {
    expect(dm.warn).not.toBeCalled()
  })
})

it("does nothing when only `test` files were changed", () => {
  dm.danger.github = {
    api: {
      gitdata: {
        getTree: () => Promise.resolve({ data: { tree: [{ path: "CHANGELOG.md" }] } }),
      },
    },
    pr,
  }
  dm.danger.git = {
    modified_files: ["tests/AuctionCalculatorSpec.scala"],
    created_files: [],
  }
  return rfc16().then(() => {
    expect(dm.warn).not.toBeCalled()
  })
})

it("does nothing when the changelog was changed", () => {
  dm.danger.github = {
    api: {
      gitdata: {
        getTree: () => Promise.resolve({ data: { tree: [{ path: "code.js" }, { path: "CHANGELOG.md" }] } }),
      },
    },
    pr,
  }
  dm.danger.git = {
    modified_files: ["src/index.html", "CHANGELOG.md"],
    created_files: [],
  }
  return rfc16().then(() => {
    expect(dm.warn).not.toBeCalled()
  })
})

it("does not warns with a closed PR", () => {
  dm.danger.github = {
    api: {
      gitdata: {
        getTree: () => Promise.resolve({ data: { tree: [{ path: "code.js" }, { path: "CHANGELOG.md" }] } }),
      },
    },
    pr: { ...pr, state: "closed" },
  }
  dm.danger.git = {
    modified_files: ["src/index.html"],
    created_files: [],
  }
  return rfc16().then(() => {
    expect(dm.warn).not.toBeCalled()
  })
})
