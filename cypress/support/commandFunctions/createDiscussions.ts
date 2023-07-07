import { DiscussionCreateInput } from "../../../src/__generated__/graphql";

const seedDiscussions = (discussions: DiscussionCreateInput[]) => {
  const operation = {
    query: `
        mutation CreateDiscussions($input: [DiscussionCreateInput!]!) {
          createDiscussions(input: $input) {
            discussions {
              id
              title
              body
              Channels {
                uniqueName
              }
              Author {
                username
              }
              Tags {
                text
              }
            }
          }
        }
      `,
    variables: {
      input: discussions,
    },
  };

  cy.request({
    url: "http://localhost:4000/graphql",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: operation,
  });
};

export default seedDiscussions;
