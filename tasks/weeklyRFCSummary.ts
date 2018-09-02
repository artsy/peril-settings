import { danger } from "danger"
import { slackMessage, slackData } from "./slackDevChannel"

const org = "artsy"
const label = "RFC"

export interface Result {
  url: string
  repository_url: string
  labels_url: string
  comments_url: string
  events_url: string
  html_url: string
  id: number
  node_id: string
  number: number
  title: string
  user: any
  labels: any[]
  state: string
  assignee?: any
  milestone?: any
  comments: number
  created_at: Date
  updated_at: Date
  closed_at?: any
  pull_request: any
  body: string
  score: number
}

// https://developer.github.com/v3/search/#search-issues

export default async () => {
  const api = danger.github.api
  const rfcQuery = `org:${org} label:${label} state:open`
  const searchResponse = await api.search.issues({ q: rfcQuery })
  const items = searchResponse.data.items

  // Bail early
  if (items.length === 0) {
    await slackMessage("No open RFCs this week.")
    return
  }

  // Convert the open issues into attachments
  const attachments = items.map((r: Result) => ({
    fallback: "Required plain-text summary of the attachment.",
    color: "#36a64f",
    author_name: r.user.login,
    author_link: r.user.html_url,
    author_icon: r.user.avatar_url,
    title: r.title,
    title_link: r.html_url,
  }))

  const text = `There are ${items.length} open RFCS:`
  await slackData({
    text,
    attachments,
    unfurl_links: false,
  })
}
