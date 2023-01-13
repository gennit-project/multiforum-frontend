import {
    InMemoryCache, ReactiveVar, makeVar
  } from "@apollo/client/core";

const cache = new InMemoryCache({
  typePolicies: {
    Tag: {
      keyFields: ["text"],
    },
    Channel: {
      keyFields: ["uniqueName"],
      fields: {
        Tags: {
          merge: false,
        },
      },
    },
    Discussion: {
      keyFields: ["id"],
      fields: {
        Tags: {
          merge: false,
        },
        Channels: {
          merge: false,
        },
        CommentSections: {
          merge: false
        }
      },
    },
    Event: {
      keyFields: ["id"],
      fields: {
        Tags: {
          merge: false,
        },
        Channels: {
          merge: false,
        },
      },
    },
    // Comments: {
    //   keyFields: ["id"],
    //   merge: false
    // },
    CommentSections: {
      keyFields: ["id"],
      fields: {
        Comments: {
          merge: false,
        }
      }
    },
    Query: {
      fields: {
        events: {
          // Only consider it a different query if
          // the filters have changed, because we expect
          // the offset argument to change due to pagination.
          keyArgs: ['where', 'resultsOrder'],

          // Concatenate the incoming list items with
          // the existing list items.
          // More info: https://www.apollographql.com/docs/react/pagination/core-api/
          merge(existing, incoming, args) {
            let offset = args?.args?.offset;
            if (!offset) {
              offset = 0
            }
            // Slicing is necessary because the existing data is
            // immutable.
            const merged = existing ? existing.slice(0) : [];
            for (let i = 0; i < incoming.length; ++i) {
              merged[offset + i] = incoming[i];
            }
            return merged;
          },
        },
        discussions: {
          keyArgs: ['where', 'resultsOrder'],
          merge(existing, incoming, args) {
            let offset = args?.args?.offset;
            if (!offset) {
              offset = 0
            }
            const merged = existing ? existing.slice(0) : [];
            for (let i = 0; i < incoming.length; ++i) {
              merged[i] = incoming[i];
            }
            return merged;
          },
        },
        channels: {
          keyArgs: ['where', 'limit'],
          merge(existing, incoming, args) {
            let offset = args?.args?.offset;
            if (!offset) {
              offset = 0
            }
            const merged = existing ? existing.slice(0) : [];
            for (let i = 0; i < incoming.length; ++i) {
              merged[offset + i] = incoming[i];
            }
            return merged;
          },
        },
        username: {
          read(){
            // Store the username of the logged in user
            return usernameVar()
          }
        }
      },
    },
  },
});

export const usernameVar: ReactiveVar<string> = makeVar<string>('')
export default cache