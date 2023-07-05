import { EventCreateInput } from "../../../src/__generated__/graphql"

export const eventsForFilteringTests: EventCreateInput[] = [
    {
        title: "Test free/virtual event",
        startTime: "2024-04-21T02:21:37.146Z",
        endTime: "2024-04-21T02:21:37.146Z",
        Channels: {
          connect: [
            {
              where: {
                node: {
                  uniqueName: "cats",
                },
              },
            },
          ],
        },
        virtualEventUrl: "https://example.com",
        Poster: {
          connect: {
            where: {
              node: {
                username: "cluse",
              },
            },
          },
        },
        cost: "0",
        canceled: false,
        startTimeDayOfWeek: "Wednesday",
        startTimeHourOfDay: 20,
      },
      {
        title: "Test online event in phx_music",
        startTime: "2024-04-21T02:21:37.146Z",
        endTime: "2024-04-21T02:21:37.146Z",
        Channels: {
          connect: [
            {
              where: {
                node: {
                  uniqueName: "phx_music",
                },
              },
            },
          ],
        },
        Tags: {
          "connectOrCreate": [
            {
              "onCreate": {
                "node": {
                  "text": "newYears"
                }
              },
              "where": {
                "node": {
                  "text": "newYears"
                }
              }
            }
          ]
        },
        virtualEventUrl: "https://example.com",
        Poster: {
          connect: {
            where: {
              node: {
                username: "cluse",
              },
            },
          },
        },
        cost: "0",
        canceled: false,
        startTimeDayOfWeek: "Wednesday",
        startTimeHourOfDay: 20,
      },
      {
        title: "Test event with a trivia tag",
        startTime: "2024-04-21T02:21:37.146Z",
        endTime: "2024-04-21T02:21:37.146Z",
        Channels: {
          connect: [
            {
              where: {
                node: {
                  uniqueName: "phx_music",
                },
              },
            },
          ],
        },
        Tags: {
          "connectOrCreate": [
            {
              "onCreate": {
                "node": {
                  "text": "trivia"
                }
              },
              "where": {
                "node": {
                  "text": "trivia"
                }
              }
            }
          ]
        },
        virtualEventUrl: "https://example.com",
        Poster: {
          connect: {
            where: {
              node: {
                username: "cluse",
              },
            },
          },
        },
        cost: "0",
        canceled: false,
        startTimeDayOfWeek: "Wednesday",
        startTimeHourOfDay: 20,
      },
]