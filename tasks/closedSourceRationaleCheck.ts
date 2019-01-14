import { danger } from "danger"

export const artsyOrg = "artsy"
export const targetPath = "README.md"
export const targetText = "Rationale for Closed Source"
export const issueTitle = "Missing rationale for closed source"
export const issueContent = "This repo is closed source but seems to be missing rationale in the README."

interface Repo {
  name: string
  readme: string
}

const getPrivateRepos = async (): Promise<Repo[]> => {
  const { data: repos } = await danger.github.api.repos.getForOrg({ org: artsyOrg, type: "private", per_page: 100 })
  return repos.map(repo => ({ name: repo.name, readme: "" }))
}

const getReadme = async (name: string): Promise<string> => {
  return await danger.github.utils.fileContents(targetPath, name)
}

const getInvalidRepos = async (privateRepos: Repo[]): Promise<Repo[]> => {
  const promises = privateRepos.map(async repo => {
    repo.readme = await getReadme(repo.name)
  })
  await Promise.all(promises)

  const missingRepos = privateRepos.filter(repo => !repo.readme.includes(targetText))
  return missingRepos
}

const createIssuesFor = async (missingRepos: Repo[]): Promise<string[]> => {
  const openedIssues = missingRepos.map(repo => {
    const config = { open: true, owner: artsyOrg, repo: repo.name, title: issueTitle }
    return danger.github.utils.createUpdatedIssueWithID(repo.name, issueContent, config)
  })

  return Promise.all(openedIssues)
}

export default async () => {
  const privateRepos = await getPrivateRepos()
  const invalidRepos = await getInvalidRepos(privateRepos)
  const issueURLs = await createIssuesFor(invalidRepos)

  // what should i do with these things??
  console.log(issueURLs)
}
