const deleteDiscussions = () => {
    cy.request({
      url: "http://localhost:4000/graphql",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        query: `
              mutation deleteDiscussion {
                deleteDiscussions {
                  nodesDeleted
                }
              }
              `,
      },
    });
  };
  export default deleteDiscussions;
  