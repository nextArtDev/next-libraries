'use server'
const headers = {
  Authorization:
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNjc0NjQ2Y2RiZTc2N2E5NmI5YTIwYjNkIiwiaWF0IjoxNzMyNjU4ODk0LCJleHAiOjE3MzI3NDUyOTQsInR5cGUiOiJhY2Nlc3MifQ.N4ckqIdrTgvHaHhMMRmqwIJoiwq75iFlrOU8j9QsikQ', // replace your token here
  'Content-Type': 'application/json',
}

async function delay(ms) {
  return new Promise((reslove) => setTimeout(() => reslove(true), ms))
}

async function getMissions() {
  try {
    const res = await fetch('https://api-mission.goatsbot.xyz/missions/user', {
      method: 'GET', // Optional, as GET is the default method
      headers: headers,
    })

    if (!res.ok) {
      // throw new Error(HTTP error! status: ${res.status});
      console.log(res)
    }

    const data = await res.json()
    return Object.values(data).flat(1)
  } catch (error) {}
}

async function completeAllOfMissions(missions) {
  for (let i = 0; i < missions?.length; i++) {
    const res = await fetch(
      `https://dev-api.goatsbot.xyz/missions/action/${missions[i]._id}`,
      {
        method: 'POST',
        headers,
      }
    )

    console.log(i, res.status)

    await delay(500)
  }
}

async function viewAdv() {
  try {
    const res = await fetch(
      'https://dev-api.goatsbot.xyz/missions/action/66db47e2ff88e4527783327e',
      // { method: 'POST', headers }
      {
        method: 'POST', // Optional, as GET is the default method
        headers: headers,
      }
    )

    const data = await res.json()
    console.log('adv -', data.status ?? data.message)
  } catch (error) {}
}

export async function makeMoney() {
  const missions = await getMissions()
  await completeAllOfMissions(missions)

  await viewAdv()
  setInterval(viewAdv, 60000)
}

// makeMoney()

console.log('excuted: started...')
