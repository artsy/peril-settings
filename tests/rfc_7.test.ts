jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import { rfc13 } from "../org/all-prs"

beforeEach(() => {
  dm.danger = {}
})

it("does nothing", () => {

})
