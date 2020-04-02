import { WebClient } from "@slack/client"
import { peril } from "danger"
import fetch from "node-fetch"
import * as querystring from "querystring"

export default async () => {
  const opsGenieOnCallStaffEmails = await emailsFromOpsGenie()

  await sendMessageForEmails(opsGenieOnCallStaffEmails)
}

export const emailsFromOpsGenie = async (today = new Date()) => {
  const targetDate = new Date(today.getTime())
  const qs = querystring.stringify({ date: targetDate.toISOString() })
  const url = `https://api.opsgenie.com/v2/schedules/${peril.env.OPSGENIE_SCHEDULE_ID}/on-calls?${qs}`
  const req = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `GenieKey ${peril.env.OPSGENIE_API_KEY}`,
    },
  })

  const body = await req.json()
  return body.data.onCallParticipants.map((participant: any) => {
    return participant.name
  })
}

export const sendMessageForEmails = async (emails: string[]) => {
  console.log(`The following emails are on call: ${emails}. Now looking up Slack IDs.`)

  const slackToken = peril.env.SLACK_WEB_API_TOKEN
  const web = new WebClient(slackToken)
  const onCallStaffUsers = await Promise.all(emails.map(email => web.users.lookupByEmail({ email })))

  const onCallStaffMentions = onCallStaffUsers
    .filter(r => r.ok) // Filter out any failed lookups.
    .map((response: any) => response.user.id as string)
    .map(id => `<@${id}>`) // See: https://api.slack.com/docs/message-formatting#linking_to_channels_and_users

  const { slackMessage } = await import("./slackDevChannel")

  await slackMessage(
    `${onCallStaffMentions.join(
      ", "
    )} it looks like you are on-call this week, so you’ll be running the Monday standup at 11:30 NYC time. Here are the docs: https://github.com/artsy/README/blob/master/events/open-standup.md`
  )
}
