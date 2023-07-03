import emails from "../../seedData/emails";

const seedEmails = () => {
  const operation = {
    query: `
        mutation CreateEmails($input: [EmailCreateInput!]!) {
          createEmails(input: $input) {
            emails {
              address
            }
          }
        }
      `,
    variables: {
      input: emails,
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

export default seedEmails;
