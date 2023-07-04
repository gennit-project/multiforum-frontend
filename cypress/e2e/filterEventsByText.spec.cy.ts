import { ONLINE_EVENT_LIST } from "./constants";
import { deleteAll, seedAll } from "./utils";

describe("Filter events by text", () => {
  beforeEach(function () {
    deleteAll();
    seedAll();
  });

  it("filters events by text in the sitewide online events list", () => {
    const searchTerm = "virtual";

    cy.visit(ONLINE_EVENT_LIST);
    cy.get('div[data-testid="event-filter-search-bar"]')
      .find("input")
      .type(`${searchTerm}{enter}`);

    // should have one result
    cy.get('ul[data-testid="event-list"]').find("li").should("have.length", 1);

    // top result contains the search term
    cy.get('ul[data-testid="event-list"]').find("li").contains(searchTerm);
  });

  // todo: channel view
});
