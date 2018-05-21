import { danger } from "danger"

export default async () => {
  const api = danger.github.api
  const { data: orgs } = await api.repos.getForOrg({ org: "artsy", type: "public", per_page: 100 })

  for (const org of orgs) {
    const { data: contents } = await api.repos.getContent({ owner: "artsy", repo: org.name, path: "LICENSE" })
    const license = Buffer.from(contents.content, "base64").toString("utf8")

    if (!license.includes("2018")) {
      // Say that it needs changing
    }
  }
}
