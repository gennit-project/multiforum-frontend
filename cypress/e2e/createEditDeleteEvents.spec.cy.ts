import { EVENT_CREATION_FORM } from "./constants";
import { deleteAll, seedAll } from "./utils";

describe("Basic event operations", () => {
  beforeEach(function () {
    deleteAll();
    seedAll();
    cy.loginWithCreateEventButton();
  });

  it("creates, edits and deletes an online event", () => {
    const TEST_TITLE = "Tempe Event Title";
    const TEST_LINK = "https://www.test.com";
    const TEST_LINK_2 = "https://www.test2.com";

    // Test creating an event
    cy.visit(EVENT_CREATION_FORM);
    cy.get('input[data-testid="title-input"]').type(TEST_TITLE);

    cy.get('input[data-testid="channel-input"]').type("phx_music{enter}");

    cy.get('input[data-testid="start-time-date-input"]').type("2023-12-01");

    cy.get('input[data-testid="start-time-time-input"]').type("08:30");

    cy.get('input[data-testid="end-time-date-input"]').type("2023-12-01");

    cy.get('input[data-testid="end-time-time-input"]').type("09:30");

    cy.get('div[data-testid="link-input"]').find("input").type(TEST_LINK);

    cy.get('div[data-testid="description-input"]')
      .find("textarea")
      .type("Test description");

    cy.get("button").contains("Save").click();
    cy.get("h2").contains(TEST_TITLE);
    cy.get("span").contains(TEST_LINK);

    // Test editing an event
    cy.get("button").contains("Edit").click();
    cy.get('div[data-testid="link-input"]').find("input").focus().clear();

    cy.get('div[data-testid="link-input"]').find("input").type(TEST_LINK_2);

    cy.get("button").contains("Save").click();

    cy.get("span").contains(TEST_LINK_2);

    // Test canceling an event
    cy.get("span").contains("Cancel").click();
    cy.get("button").contains("Yes").click();
    cy.get("p[data-testid='canceled-event-banner']").should("exist");

    // Test deleting an event
    cy.get("span").contains("Delete").click();
    cy.get("button").contains("Delete").click();
    // After deletion, the user should be redirected to the online event list
    // for the channel view
    cy.url().should("include", "events/search");
  });

  // need to mock this.
  // cy.get('div[data-testid="location-input"]')
  //   .find('input')
  //   .type("Tempe Public Library{downArrow}")
  //   .type("{enter}");
});
