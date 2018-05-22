import { danger } from "danger"

export default async () => {
  const api = danger.github.api
  const org = "artsy"
  const { data: repos } = await api.repos.getForOrg({ org, type: "public", per_page: 100 })

  const markdowns: string[] = []
  for (const repo of repos) {
    const { data: contents } = await api.repos.getContent({ owner: org, repo: repo.name, path: "LICENSE" })
    const license = Buffer.from(contents.content, "base64").toString("utf8")

    if (!license.includes("2018")) {
      // Say that it needs changing
      const slug = `${org}/${repo.name}`
      markdowns.push(`- [${slug}](https://github.com/${slug}/blob/master/CHANGELOG).`)
    }
  }

  const open = markdowns.length > 0
  const header = `List of repos which have a license without 2018 in them.\n\'n`
  const contentWithRepos = `${header}\n\n${markdowns.join("\n")}`
  const noOpenRepos = "This issue will be updated next year"

  const body = open ? contentWithRepos : ""
  const title = "Public Repos which have a license that's not up-to-date"

  await danger.github.utils.createUpdatedIssueWithID("License-Check", body, {
    title,
    open,
    owner: "artsy",
    repo: "potential",
  })
}
