const HOME = "http://localhost:5173/";
const ONLINE_EVENT_LIST = "http://localhost:5173/events/list/search"
const EVENT_CREATION_FORM = "http://localhost:5173/events/create"

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
  beforeEach(function () {
    cy.loginWithCreateEventButton();
  });

  it("navigates to the online event list", () => {
    cy.visit(HOME);
    cy.get('[data-testid="menu-button"]').click();
    cy.get('[data-testid="nav-link-Online Events"]').click();
    cy.url().should("include", ONLINE_EVENT_LIST);
    cy.get('[data-testid="real-create-event-button"]').should("exist");
  })

  it("logs in and navigates to the event creation form", () => {
    cy.visit(ONLINE_EVENT_LIST).get('[data-testid="real-create-event-button"]').click().wait(1000);
    cy.get('[data-testid="event-form"]').should("exist");
  })

  it("creates an online event", () => {
    const TEST_TITLE = "Tempe Event Title";
    const TEST_LINK = "https://www.test.com";

    cy.visit(EVENT_CREATION_FORM);
    cy.get('input[data-testid="title-input"]')
      .type(TEST_TITLE);

    cy.get('input[data-testid="channel-input"]')
      .type("Tempe{enter}");

    cy.get('sl-input[data-testid="start-time-input"]')
      .shadow()
      .find('input')
      .type("2023-12-01T08:30");

    cy.get('sl-input[data-testid="end-time-input"]')
      .shadow()
      .find('input')
      .type("2023-12-01T08:30");

    cy.get('div[data-testid="link-input"]')
      .find('input')
      .type(TEST_LINK);

    cy.get('div[data-testid="description-input"]')
      .find('textarea')
      .type("Test description");

    cy.get("button").contains("Save").click();
    cy.get("h2").contains(TEST_TITLE);
    cy.get("span").contains(TEST_LINK);
  });

    // need to mock this.
    // cy.get('div[data-testid="location-input"]')
    //   .find('input')
    //   .type("Tempe Public Library{downArrow}")
    //   .type("{enter}");
});
