import { DiscussionCreateInput } from "../../../src/__generated__/graphql"

export const discussionsForFilteringTests: DiscussionCreateInput[] = [
    {
        title: "Test discussion 1, about cats",
        body: "Test discussion body 1",
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
        Author: {
          connect: {
            where: {
              node: {
                username: "cluse",
              },
            },
          },
        },
      },
      {
        title: "Test discussion 2",
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
        Author: {
          connect: {
            where: {
              node: {
                username: "cluse",
              },
            },
          },
        },
      },
      {
        title: "Test discussion 3",
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
        Author: {
          connect: {
            where: {
              node: {
                username: "cluse",
              },
            },
          },
        },
      },
]