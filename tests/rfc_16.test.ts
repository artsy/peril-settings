jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import { rfc16 } from "../org/allPRs"

beforeEach(() => {
  dm.danger = {}
  dm.warn = jest.fn()
})

const pr = {
  base: {
    user: {
      login: "danger",
    },
    repo: {
      name: "danger-js",
    },
  },
  state: "open",
  body: "Hello World",
}

it("warns when code has changed but no changelog entry was made", () => {
  dm.danger.github = {
    api: {
      git: {
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
      git: {
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

it("does nothing when there is a .autorc file in the root of the repo", async () => {
  const paths = ["code.js", ".autorc", "CHANGELOG.md"]
  const data = {
    tree: paths.map((path) => ({ path })),
  }

  dm.danger.github = {
    api: {
      git: {
        getTree: () => Promise.resolve({ data }),
      },
    },
    pr,
  }

  dm.danger.git = {
    modified_files: ["src/index.html"],
    created_files: [],
  }

  await rfc16()
  expect(dm.warn).not.toBeCalled()
})

it("does nothing when only `test` files were changed", () => {
  dm.danger.github = {
    api: {
      git: {
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
      git: {
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
      git: {
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

it("is skipped via #trivial", () => {
  dm.danger.github = {
    api: {
      git: {
        getTree: () => Promise.resolve({ data: { tree: [{ path: "code.js" }, { path: "CHANGELOG.md" }] } }),
      },
    },
    pr: { ...pr, body: "Skip this, #trivial" },
  }
  dm.danger.git = {
    modified_files: ["src/index.html"],
    created_files: [],
  }
  return rfc16().then(() => {
    expect(dm.warn).not.toBeCalled()
  })
})

it("skips for eigen", () => {
  const prForEigen = {
    base: {
      user: {
        login: "danger",
      },
      repo: {
        name: "eigen",
      },
    },
    state: "open",
    body: "Hello World",
  }

  dm.danger.github = {
    api: {
      git: {
        getTree: () => Promise.resolve({ data: { tree: [{ path: "code.js" }, { path: "CHANGELOG.md" }] } }),
      },
    },
    pr: { ...prForEigen, body: "Normal PR title" },
  }

  dm.danger.git = {
    modified_files: ["src/index.html"],
    created_files: [],
  }

  return rfc16().then(() => {
    expect(dm.warn).not.toBeCalled()
  })
})
