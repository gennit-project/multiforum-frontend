import { InMemoryCache, ReactiveVar, makeVar } from "@apollo/client/core";

export const usernameVar: ReactiveVar<string> = makeVar<string>("");
export const modProfileIdVar: ReactiveVar<string> = makeVar<string>("");
export const modProfileNameVar: ReactiveVar<string> = makeVar<string>("");
export const themeVar: ReactiveVar<string> = makeVar<string>(
  localStorage.getItem("theme") || "light"
);

const standardMerge = (existing: any, incoming: any, args: any) => {
  let offset = args?.args?.offset;
  if (!offset) {
    offset = 0;
  }
  const merged = existing ? existing.slice(0) : [];
  for (let i = 0; i < incoming.length; ++i) {
    merged[i] = incoming[i];
  }
  return merged;
};

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
          merge: false,
        },
        DownvotedByModerators: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        UpvotedByUsers: {
          merge(existing, incoming) {
            return incoming;
          },
        },
      },
    },
    Comment: {
      keyFields: ["id"],
      fields: {
        DownvotedByModerators: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        UpvotedByUsers: {
          merge(existing, incoming) {
            return incoming;
          },
        },
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
    CommentSection: {
      fields: {
        DownvotedByModerators: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        UpvotedByUsers: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        Comments: {
          merge: false,
        },
      },
    },
    Query: {
      fields: {
        theme: {
          read() {
            return themeVar();
          },
        },
        events: {
          // Only consider it a different query if
          // the filters have changed, because we expect
          // the offset argument to change due to pagination.
          keyArgs: ["where", "resultsOrder"],

          // Concatenate the incoming list items with
          // the existing list items.
          // More info: https://www.apollographql.com/docs/react/pagination/core-api/
          merge: standardMerge,
        },
        discussions: {
          keyArgs: ["where", "resultsOrder"],
          merge: standardMerge,
        },
        channels: {
          keyArgs: ["where", "limit"],
          merge: standardMerge,
        },
        username: {
          read() {
            // Store the username of the logged in user
            return usernameVar();
          },
        },
        modProfileId: {
          read() {
            return modProfileIdVar();
          },
        },
        modProfileName: {
          read() {
            // Store the mod profile name of the logged in user
            return modProfileNameVar();
          },
        },
      },
    },
  },
});

export default cache;
