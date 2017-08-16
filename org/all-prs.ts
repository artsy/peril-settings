import { schedule } from "danger"

// Check for dependency changes
import yarn from "danger-plugin-yarn"
schedule(yarn())

// Check out docs
import spellcheck from "danger-plugin-spellcheck"
schedule(spellcheck({ settings: "artsy/artsy-danger@spellcheck.json" }))
