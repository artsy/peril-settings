import { danger, warn, peril } from "danger"
export default async () => {
  const pr = danger.github.pr

  if (pr.title.includes("Test PR")) {
    warn("This is a test PR.")
    await peril.runTask("test-task", "in 1 minute", { prNumber: pr.number })
  }
}
