import { danger } from "danger"

export default async () => {
  const api = danger.github.api
  const org = "artsy"
  const year = new Date().getFullYear().toString()
  const { data: repos } = await api.repos.getForOrg({ org, type: "public", per_page: 100 })
  console.log(`Found ${repos.length} repos`)

  const noLicense: string[] = []
  const noThisYear: string[] = []

  for (const repo of repos) {
    console.log(`Grabbing ${org}/${repo.name}'s license`)
    const slug = `${org}/${repo.name}`
    // Skip forks
    if (repo.fork) {
      continue
    }

    try {
      const { data: contents } = await api.repos.getContent({ owner: org, repo: repo.name, path: "LICENSE" })
      const license = Buffer.from(contents.content, "base64").toString("utf8")

      // Skip repos that haven't been updated this year
      const updatedThisYear = repo.pushed_at && repo.pushed_at.includes(year)
      if (updatedThisYear && !license.includes(year)) {
        // Say that it needs changing
        noThisYear.push(`[${slug}](https://github.com/${slug})`)
      }
    } catch (error) {
      noLicense.push(`[${slug}](https://github.com/${slug})`)
    }
  }

  const open = noThisYear.length > 0 || noLicense.length > 0
  const notThisYearContent = `\n## List of repos which have a license without ${year} in them.\n\n`
  const noLicenseAndOSS = `\n## List of repos which don't have a license.\n\n`
  const contentWithRepos = [notThisYearContent, noThisYear.join(", "), noLicenseAndOSS, noLicense.join(", ")].join("\n")
  const noOpenRepos = "This issue will be updated daily"

  const body = open ? contentWithRepos : noOpenRepos
  const title = "Public Repos which have a license that's not up-to-date"

  console.log(`Posting`)
  await danger.github.utils.createUpdatedIssueWithID("License-Check", body, {
    title,
    open,
    owner: "artsy",
    repo: "potential",
  })
  console.log(`Posted`)
}
