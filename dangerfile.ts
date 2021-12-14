import { danger, warn } from "danger"

export default async () => {
  const notification =
    "New rules detected, you probably need to update [this document](https://github.com/artsy/README/blob/main/culture/peril.md)."
  const packageDiff = await danger.git.JSONDiffForFile("peril.settings.json")
  const changeDetected = !!packageDiff.rules || !!packageDiff.scheduler

  if (changeDetected) {
    warn(notification)
  }
}
