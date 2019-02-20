// @ts-check
// Why JS? So that I can ensure that there is at least one Babelified file
// in the Artsy peril settings.

import fetch from "node-fetch"

// https://team.artsy.net/api?query=%7B%0A%20%20members(team%3A%22Gallery%20Partnerships%22)%20%7B%0A%20%20%20%20name%0A%20%20%20%20slackID%0A%20%20%20%20country%0A%20%20%20%20city%0A%20%20%7D%0A%7D

const query = `
{
  members(team:"Gallery Partnerships") {
    name
    slackID
    country
    city
  }
}
`

export default async () => {
  const req = await fetch("https://team.artsy.net/api", {
    method: "POST",
    headers: { secret: peril.env.TEAM_NAV_SECRET },
    body: { query },
  })

  const data = await req.json()
  console.log(data)
}
