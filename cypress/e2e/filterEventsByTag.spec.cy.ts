import { ONLINE_EVENT_LIST } from "./constants";
import { deleteAll, seedAll } from "./utils";
import { eventsForFilteringTests } from "./testData/eventsForFilteringTests";

describe("Filter events by tag", () => {
  beforeEach(function () {
    deleteAll();
    seedAll();
    // Create events with tags referenced in these tests (newYears, trivia)
    cy.createEvents(eventsForFilteringTests);
  });

  const newYearsTagEventTitle = "Test online event in phx_music";
  const triviaTaggedEventTitle = "Test event with a trivia tag";

  it("in the sitewide online events list, filters events by text", () => {
    cy.visit(ONLINE_EVENT_LIST);
    cy.get('div[data-testid="tag-filter-button"]').find("button").click(); // open the tag picker

    cy.get('span[data-testid="tag-picker-newYears"]').click(); // click the newYears tag

    // should have one result
    cy.get('ul[data-testid="event-list"]').find("li").should("have.length", 1);

    // top result contains the search term
    cy.get('ul[data-testid="event-list"]')
      .find("li")
      .contains(newYearsTagEventTitle);
  });

  it("in the sitewide online events list, when filtering by two tags, shows events that have at least one of the tags", () => {
    cy.visit(ONLINE_EVENT_LIST);
    cy.get('div[data-testid="tag-filter-button"]').find("button").click(); // open the tag picker

    // click the newYears tag
    cy.get('span[data-testid="tag-picker-newYears"]').click();

    // click the trivia tag
    cy.get('span[data-testid="tag-picker-trivia"]').click();

    // should have two results
    cy.get('ul[data-testid="event-list"]').find("li").should("have.length", 2);

    // The expected events are in the results
    cy.get('ul[data-testid="event-list"]')
      .find("li")
      .contains(newYearsTagEventTitle);
    cy.get('ul[data-testid="event-list"]')
      .find("li")
      .contains(triviaTaggedEventTitle);
  });
});
