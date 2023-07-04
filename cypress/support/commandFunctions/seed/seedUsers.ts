import users from "../../seedData/users";

const seedUsers = () => {
  const operation = {
    query: `
        mutation CreateUsers($input: [UserCreateInput!]!) {
          createUsers(input: $input) {
            users {
              username
              Email {
                address
              }
            }
          }
        }
      `,
    variables: {
      input: users,
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

export default seedUsers;
