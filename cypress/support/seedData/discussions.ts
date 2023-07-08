import { DiscussionCreateInput } from "../../../src/__generated__/graphql"

export const discussionsForFilteringTests: DiscussionCreateInput[] = [
    {
        title: "Example topic 1",
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
        title: "Example topic 2",
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
        title: "Example topic 3",
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

export default discussionsForFilteringTests;