import { IN_PERSON_EVENT_LIST } from "../constants";
import { deleteAll, seedAll } from "../utils";
import eventsForFilteringTests from "../../support/seedData/eventsForFilteringTests";

describe("Filter events by text", () => {
  beforeEach(function () {
    deleteAll();
    seedAll();
    cy.createEvents(eventsForFilteringTests);
  });

  it("in the sitewide in-person events list, filters events by distance", () => {
    // Go to the map view.
    cy.visit(IN_PERSON_EVENT_LIST);

    // Open the "More Filters" drawer.
    cy.get('button[data-testid="more-filters-button"]').click();

    // Click the distance filter for 5 miles (8.04672 km).
    cy.get('button[data-testid="distance-8.04672"]').click();

    // Close the drawer.
    cy.get('button[data-testid="close-drawer-bottom-button"]').click();

    // Should have three result, all in Yucca Tap Room,
    // which is within 5 miles of Tempe, AZ, the default location.
    cy.get('ul[data-testid="event-list"]').find("li").should("have.length", 3);

    // Make sure each list item says "Yucca Tap Room."
    cy.get('ul[data-testid="event-list"]')
      .find("li")
      .each(($el) => {
        cy.wrap($el).contains("Yucca Tap Room");
      });

    // Open the "More Filters" drawer.
    cy.get('button[data-testid="more-filters-button"]').click();

    // Click the "Any Distance" button.
    cy.get('button[data-testid="distance-0"]').click();

    // Close the drawer.
    cy.get('button[data-testid="close-drawer-bottom-button"]').click();

    // There should be 12 results (all in-person events in the test data).
    cy.get('ul[data-testid="event-list"]').find("li").should("have.length", 15);

    // Click "Selena Night" in the list
    cy.get('ul[data-testid="event-list"]')
      .find("span")
      .contains("Selena Night")
      .click();

    // Confirm that the preview drawer opens and it has Selena Night
    cy.get('div[data-testid="event-preview"]').contains("Selena Night");
  });
});
