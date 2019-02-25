import { peril } from "danger"
import fetch from "node-fetch"
import { chunk, shuffle } from "lodash"

// https://team.artsy.net/api?query=%7B%0A%20%20members(team%3A%22Gallery%20Partnerships%22)%20%7B%0A%20%20%20%20name%0A%20%20%20%20slackID%0A%20%20%20%20country%0A%20%20%20%20city%0A%20%20%7D%0A%7D

const query = `
{
  members(team:"Gallery Partnerships") {
    name
    slackID
    country
    city
    title
  }
}
`
interface Member {
  name: string
  slackID: string
  country: string
  city: string
  title: string
}

export default async () => {
  const req = await fetch("https://team.artsy.net/api", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      secret: peril.env.TEAM_NAV_SECRET,
    },
    body: JSON.stringify({ query }),
  })

  const data = await req.json()
  console.log(data)
  const members = data.members as Member[]
  const chunkedMembers = chunk(shuffle(members))
  chunkedMembers.forEach(supGroup => {
    console.log(supGroup)
  })
  // const isSameLocationWeek = true
  // const splitPerLocations = _.groupBy(members, "location")
}

// const loopThroughMembersAndSendSlacks = (members: Member[]) => _.shuffle(members)

// const filterManagerFolks = (members: Member[]) =>
//   members.filter(m => !m.title.toLowerCase().includes("director") && !m.title.toLowerCase().includes("manager"))
