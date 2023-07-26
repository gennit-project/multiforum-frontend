const { delegateToSchema } = require("@graphql-tools/delegate");
const { OGM } = require("@neo4j/graphql-ogm");
const typeDefs = require("./typeDefs");

const createDiscussionChannelQuery = `
MATCH (d:Discussion {id: $discussionId}), (c:Channel {uniqueName: $channelUniqueName})
MERGE (dc:DiscussionChannel {discussionId: $discussionId, channelUniqueName: $channelUniqueName})
ON CREATE SET dc.id = apoc.create.uuid()
MERGE (dc)-[:POSTED_IN_CHANNEL]->(d) 
MERGE (dc)-[:POSTED_IN_CHANNEL]->(c)
RETURN dc, d, c
`;

module.exports = function (driver) {
  const ogm = new OGM({
    typeDefs,
    driver,
  });

  const Discussion = ogm.model("Discussion");

  const resolvers = {
    Mutation: {
      createDiscussionWithChannelConnections: async (
        parent,
        args,
        context,
        info
      ) => {
        // The reason why we cannot use the auto-generated resolver
        // to create a Discussion with DiscussionChannels already linked
        // is because the creation of the DiscussionChannel nodes
        // requires a discussion ID.

        // We do not have the discussion ID until the Discussion is created.
        // And the discussion ID is required to create the DiscussionChannel nodes.
        // in order to enforce a uniqueness constraint between one discussion
        // and one channel.
        // The reason why we have to create DiscussionChannel nodes
        // with a discussion ID, channel uniqueName, and separate relationships
        // to the Channel and Discussion nodes is because we cannot enforce
        // a uniqueness constraint based on relationships alone. That constraint
        // requires the IDs.

        // Therefore, we have to create the Discussion first, then create the
        // DiscussionChannel nodes that are linked to the Discussion and Channel nodes.

        // DiscussionChannel schema for reference:

        // type DiscussionChannel {
        //   id: ID! @id
        //   discussionId: ID! # used for uniqueness constraint
        //   channelUniqueName: String! # used for uniqueness constraint
        //   Discussion: Discussion
        //     @relationship(type: "POSTED_IN_CHANNEL", direction: OUT)
        //   Channel: Channel @relationship(type: "POSTED_IN_CHANNEL", direction: OUT)
        //    ...other fields
        // }
        console.log("args" + JSON.stringify(args, null, 2));

        const { discussionCreateInput, channelConnections } = args;

        if (!channelConnections || channelConnections.length === 0) {
          throw new Error("At least one channel must be selected");
        }

        try {
          const { discussions } = await Discussion.create({
            input: [discussionCreateInput],
          });
          const newDiscussion = discussions[0];

          const newDiscussionId = newDiscussion.id;

          const session = driver.session();

          for (let i = 0; i < channelConnections.length; i++) {
            const channelUniqueName = channelConnections[i];

            await session.run(createDiscussionChannelQuery, {
              discussionId: newDiscussionId,
              channelUniqueName: channelUniqueName,
            });
          }

          // Refetch the newly created discussion with the channel connections
          // so that we can return it.
          const selectionSet = `
            {
              id
              title
              body
              Author {
                username
              }
              DiscussionChannels {
                channelUniqueName
                discussionId
                Channel {
                  uniqueName
                }
                Discussion {
                  id
                }
              }
              createdAt
              updatedAt
              Tags {
                text
              }
            }
          `;

          const result = await Discussion.find({
            where: {
              id: newDiscussionId,
            },
            selectionSet,
          });
          console.log("discussion find ", result);
          session.close();

          return result[0];
        } catch (error) {
          console.error("Error creating discussion:", error);
          throw new Error(`Failed to create discussion. ${error.message}`);
        }
      },
    },
  };
  return {
    resolvers,
    ogm,
  };
};
