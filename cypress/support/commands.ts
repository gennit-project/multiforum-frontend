// auth0_username: process.env.VITE_AUTH0_USERNAME,
// auth0_password: process.env.VITE_AUTH0_PASSWORD,
// auth0_domain: process.env.VITE_AUTH0_DOMAIN,
// auth0_audience: process.env.VITE_AUTH0_AUDIENCE,
// auth0_scope: process.env.VITE_AUTH0_SCOPE,
// auth0_client_id: process.env.VITE_AUTH0_CLIENT_ID,
// auth0_client_secret: process.env.VITE_AUTH0_CLIENT_SECRET,
const ONLINE_EVENT_LIST = "http://localhost:5173/events/list/search"

import jwtDecode from "jwt-decode";

Cypress.Commands.add("loginWithCreateEventButton", () => {
  cy.visit(ONLINE_EVENT_LIST)
    .get('[data-testid="fake-create-event-button"]')
    .click();

  cy.origin("https://gennit.us.auth0.com", () => {
    cy.get("#username").type(Cypress.env("auth0_username"));
    cy.get("#password").type(Cypress.env("auth0_password"));

    // Click the button that says continue
    cy.get(
      'button[name="action"][value="default"][type="submit"][data-action-button-primary="true"]'
    )
      .click()
      .wait(1000);
  });
});

Cypress.Commands.add("loginProgrammatically", () => {
  // App landing page redirects to Auth0.
  const client_id = Cypress.env("auth0_client_id");
  const client_secret = Cypress.env("auth0_client_secret");
  const audience = Cypress.env("auth0_audience");
  const scope = Cypress.env("auth0_scope");
  const username = Cypress.env("auth0_username");
  const password = Cypress.env("auth0_password");

  cy.request({
    method: "POST",
    url: `https://${Cypress.env("auth0_domain")}/oauth/token`,
    body: {
      grant_type: "password",
      username,
      password,
      audience,
      scope,
      client_id,
      client_secret,
    },
  }).then(({ body }) => {
    const claims: any = jwtDecode(body.id_token);
    const {
      nickname,
      name,
      picture,
      updated_at,
      email,
      email_verified,
      sub,
      exp,
    } = claims;

    const item = {
      body: {
        ...body,
        decodedToken: {
          claims,
          user: {
            nickname,
            name,
            picture,
            updated_at,
            email,
            email_verified,
            sub,
          },
          audience,
          client_id,
        },
      },
      expiresAt: exp,
    };

    window.localStorage.setItem("auth0Cypress", JSON.stringify(item));

    cy.visit("/");
  });
});
