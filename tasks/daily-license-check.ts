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

    try {
      const { data: contents } = await api.repos.getContent({ owner: org, repo: repo.name, path: "LICENSE" })
      const license = Buffer.from(contents.content, "base64").toString("utf8")

      if (!license.includes(year)) {
        // Say that it needs changing
        noThisYear.push(`- [${slug}](https://github.com/${slug}).`)
        console.log(`- x`)
      }
    } catch (error) {
      noLicense.push(`-No License on [${slug}](https://github.com/${slug}/blob/master/CHANGELOG).`)
      console.log(`- no license`)
    }
  }

  const open = noThisYear.length > 0 || noLicense.length > 0
  const notThisYearContent = `List of repos which have a license without ${year} in them.\n\n`
  const noLicenseAndOSS = `List of repos which don't have a license.\n\n`
  const contentWithRepos = [notThisYearContent, noThisYear.join("\n"), noLicenseAndOSS, noLicense.join("\n")].join("\n")
  const noOpenRepos = "This issue will be updated next year"

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
