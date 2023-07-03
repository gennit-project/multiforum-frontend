const deleteEvents = () => {
  cy.request({
    url: "http://localhost:4000/graphql",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      query: `
          mutation deleteEvent {
            deleteEvents {
              nodesDeleted
            }
          }
          `,
    },
  });
};
export default deleteEvents;
