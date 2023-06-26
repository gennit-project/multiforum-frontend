const ONLINE_EVENT_LIST = "http://localhost:5173/events/list/search";
// const IN_PERSON_EVENT_LIST = "http://localhost:5173/map";

describe("Event filters", () => {
  beforeEach(function () {
    cy.loginWithCreateEventButton();
    cy.seedEvent();
  });

//   afterEach(function () {
//     cy.deleteEvents();
//   })

  it("filters events", () => {
   
    // Test creating an event
    cy.visit(ONLINE_EVENT_LIST);
    // cy.get('input[data-testid="title-input"]')
    //   .type(TEST_TITLE);

    // cy.get('input[data-testid="channel-input"]')
    //   .type("phx_music{enter}");

    // cy.get('sl-input[data-testid="start-time-input"]')
    //   .shadow()
    //   .find('input')
    //   .type("2023-12-01T08:30");

    // cy.get('sl-input[data-testid="end-time-input"]')
    //   .shadow()
    //   .find('input')
    //   .type("2023-12-01T08:30");

    // cy.get('div[data-testid="link-input"]')
    //   .find('input')
    //   .type(TEST_LINK);

    // cy.get('div[data-testid="description-input"]')
    //   .find('textarea')
    //   .type("Test description");

    // cy.get("button").contains("Save").click();
    // cy.get("h2").contains(TEST_TITLE);
    // cy.get("span").contains(TEST_LINK);

    // // Test editing an event
    // cy.get("button").contains("Edit").click();
    // cy.get('div[data-testid="link-input"]')
    //   .find('input')
    //   .focus()
    //   .clear()

    // cy.get('div[data-testid="link-input"]')
    //   .find('input')
    //   .type(TEST_LINK_2);

    // cy.get("button").contains("Save").click();

    // cy.get("span").contains(TEST_LINK_2);

    // // Test canceling an event
    // cy.get("span").contains("Cancel").click();
    // cy.get("button").contains("Yes").click();
    // cy.get("p[data-testid='canceled-event-banner']").should("exist");


    // // Test deleting an event
    // cy.get("span").contains("Delete").click();
    // cy.get("button").contains("Delete").click();
    // // After deletion, the user should be redirected to the online event list
    // // for the channel view
    // cy.url().should("include", "events/search");

  });
});