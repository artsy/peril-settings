import { danger } from "danger"
import { google, calendar_v3 } from "googleapis"
import { JWT } from "google-auth-library"

// TODO: Move this into an env var.
let privatekey: any = require("../private_key.json")

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]
const CALENDAR_ID = "" // TODO: Reference fron env var.

const run = async () => {
  /*
  Plan:
  1. Look up Google Calendar somehow. [Done]
  2. Somehow match the email addresses to Slack user IDs and construct a reminder message.
  3. Post that message to #dev.
  */
  let jwtClient = new google.auth.JWT(privatekey.client_email, undefined, privatekey.private_key, SCOPES)
  try {
    await jwtClient.authorize()
    const events = await listEvents(jwtClient)
    const today = new Date("2019-01-07") // TODO: Remove this testing date.
    const currentSupportEvents = events.filter(event => {
      const eventStart = new Date((event.start && event.start.date) || "")
      const eventEnd = new Date((event.end && event.end.date) || "")
      const ongoingEvent = eventStart <= today
      const extendsPastToday = eventEnd > new Date(today.getTime() + 3600 * 24 * 1000)
      return ongoingEvent && extendsPastToday
    })
    currentSupportEvents.map((event: any, i: number) => {
      const start = event.start.dateTime || event.start.date
      const end = event.end.dateTime || event.end.date
      console.log(`${start} - ${end}, ${event.summary}`)
    })
    // console.log(currentSupportEvents.length)
    const onCallStaffEmails = currentSupportEvents
      .reduce((acc, event) => acc.concat(event.attendees || []), [] as calendar_v3.Schema$EventAttendee[])
      .map(attendee => attendee.email)
    console.log(onCallStaffEmails)
  } catch (error) {
    console.error(`Couldn't authorize: ${error}`)
  }
}
export default run

// run()

const listEvents = async (auth: JWT): Promise<calendar_v3.Schema$Event[]> => {
  const cal = google.calendar({ version: "v3", auth })
  try {
    const response = await cal.events.list({
      calendarId: CALENDAR_ID,
      timeMin: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(), // Look a week ago.
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    })
    return response.data.items || []
  } catch (error) {
    console.error("The API returned an error: " + error)
    return []
  }
}
