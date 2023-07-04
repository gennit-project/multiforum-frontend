import { ONLINE_EVENT_LIST } from "./constants";
import { deleteAll, seedAll } from "./utils";

describe("Filter events by tag", () => {
  beforeEach(function () {
    deleteAll();
    seedAll();
  });

  it("filters events by text in the sitewide online events list", () => {
    const searchTerm = "Test online event in phx_music";

    cy.visit(ONLINE_EVENT_LIST);
    cy.get('div[data-testid="tag-filter-button"]')
      .find("button")
      .click() // open the channel picker

    cy.get('span[data-testid="tag-picker-newYears"]')
      .click() // click the newYears tag

    // should have one result
    cy.get('ul[data-testid="event-list"]').find("li").should("have.length", 1);

    // top result contains the search term
    cy.get('ul[data-testid="event-list"]').find("li").contains(searchTerm);
  });

});
