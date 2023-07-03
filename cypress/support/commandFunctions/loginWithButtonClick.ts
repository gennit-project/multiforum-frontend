const ONLINE_EVENT_LIST = "http://localhost:5173/events/list/search"

const login = () => {
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
};

export default login;
