const HOME = "http://localhost:5173/";
const ONLINE_EVENT_LIST = "http://localhost:5173/events/list/search"

// describe('Event creation works', () => {
//     it('Creates an event', () => {
//         cy.visit('/events')

//         examples
//         cy.get('.class').contains('text').click()
//         cy.url().should('include', '/events')

//         cy.get('button').contains('Create Event').click()
//         cy.get('input[name="name"]').type('My event')
//         cy.get('input[name="date"]').type('2020-12-31')
//         cy.get('input[name="time"]').type('12:00')
//         cy.get('input[name="location"]').type('My house')
//         cy.get('input[name="description"]').type('My description')
//         cy.get('button').contains('Create').click()
//         cy.get('h2').contains('My event')
//     })
// })

describe("first test ", () => {
  // beforeEach(function () {
  //   cy.login();
  // });
  // it("should visit", () => {
  //   cy.visit(HOME);
  // });

  it("navigates to the online event list", () => {
    cy.visit(HOME);
    cy.get('[data-testid="menu-button"]').click();
    cy.get('[data-testid="nav-link-Online Events"]').click();
    cy.url().should("include", ONLINE_EVENT_LIST);
    cy.get('[data-testid="fake-create-event-button"]').should("exist");
  })

  it("logs in and navigates to the event creation form", () => {
    cy.visit(ONLINE_EVENT_LIST).get('[data-testid="fake-create-event-button"]').click();

    cy.origin('https://gennit.us.auth0.com', () => {
      cy.get("#username").type(Cypress.env("auth0_username"));
      cy.get("#password").type(Cypress.env("auth0_password"));
  
      // Click the button that says continue
      cy.get('button[name="action"][value="default"][type="submit"][data-action-button-primary="true"]').click().wait(1000);

      
    })
    cy.visit(ONLINE_EVENT_LIST).get('[data-testid="real-create-event-button"]').click().wait(1000);
    cy.get('[data-testid="event-form"]').should("exist");
  })

});
