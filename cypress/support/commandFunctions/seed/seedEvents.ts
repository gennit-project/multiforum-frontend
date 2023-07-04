import events from "../../seedData/events";

const seedEvents = () => {
  const operation = {
    query: `
        mutation CreateEvents($input: [EventCreateInput!]!) {
          createEvents(input: $input) {
            events {
              id
              title
              description
              Channels {
                uniqueName
              }
              Poster {
                username
              }
              isInPrivateResidence
              cost
              Tags {
                text
              }
            }
          }
        }
      `,
    variables: {
      input: events,
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

export default seedEvents;
