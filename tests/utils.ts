import * as fs from "fs"

export const rfc =  async (id: string, reason: string, closure: any) => {
  const thisTestPath = (expect as any).getState("testPath").testPath as string
  const numberRegex = /rfc_(.*).test.ts/
  const matches = thisTestPath.match(numberRegex)
  if (matches && matches.length > 1) {
    if (id === matches[1]) {
      if (closure instanceof Promise) {
        await closure
      } else {
        closure()
      }
    }
  }
}

export const runDangerfile = (path: string) => {
  const file = fs.readFileSync(path, "utf8")
  const es6Pattern = /^.* from ('|")danger('|");?$/gm
  const ts = require("typescript") // tslint:disable-line
  const contents = file.replace(es6Pattern, "// Removed import")
  let result = ts.transpileModule(contents, {})
  let js = result.outputText
  eval(js)
}
