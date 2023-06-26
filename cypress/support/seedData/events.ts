const events = 
[
  {
    title: "GATHERING OF BONES",
    description: "with Arsenic Kitchen, Commiserate, Killing Sunday",
    startTime: "2023-01-20T05:21:37.146Z",
    endTime: "2023-01-20T05:21:37.146Z",
    Channels: {
      connect: {
          where: {
            node: {
              uniqueName: "phx_music"
            }
          }
        }
    },
    location: {
      latitude: 33.392620,
      longitude: -111.940498
    },
    locationName: "Yucca Tap Room",
    address: "29 W Southern Ave, Tempe, AZ 85282",
    Poster: {
      connectOrCreate: {
        onCreate: {
          node: {
            username: "Alice"
          }
        },
        where: {
          node: {
            username: "Alice"
          }
        }
      }
    },
    cost: "Free",
    startTimeYear: "2023",
    startTimeMonth: "1",
    startTimeDayOfMonth: "20",
    startTimeDayOfWeek: "Thursday",
    startTimeHourOfDay: 20,
    canceled: false
  },
]

export default events;