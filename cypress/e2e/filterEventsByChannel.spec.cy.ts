import { ONLINE_EVENT_LIST } from "./constants";
import { deleteAll, seedAll } from "./utils";

describe("Filter events by channel", () => {
  beforeEach(function () {
    deleteAll();
    seedAll();
  });

  it("filters events by channel in the sitewide online events list", () => {
    const searchTerm = "Test free/virtual event";

    cy.visit(ONLINE_EVENT_LIST);
    cy.get('div[data-testid="channel-filter-button"]')
      .find("button")
      .click() // open the channel picker

    cy.get('span[data-testid="channel-picker-cats"]')
      .click() // click the cats channel

    // should have one result
    cy.get('ul[data-testid="event-list"]').find("li").should("have.length", 1);

    // top result contains the search term
    cy.get('ul[data-testid="event-list"]').find("li").contains(searchTerm);
  });
});
