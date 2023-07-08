import { ONLINE_EVENT_LIST } from "../constants";
import { deleteAll } from "../utils";
import { DateTime } from "luxon";
import { EventCreateInput } from "../../../src/__generated__/graphql";

// const timeZone = Cypress.env("TZ");
// const now = DateTime.now().setZone(timeZone);

type TestEventData = {
  start: string;
  end: string;
  name: string;
  startTimeDayOfWeek: string;
  startTimeHourOfDay: number;
};

// We create three events:
// 1. A virtual event on Monday at 10am
// 2. A virtual event on Tuesday at 10am
// 3. A virtual event on Tuesday at 6pm

const testEventData: TestEventData[] = [
  {
    // Use luxon to start on the next Monday at 10am
    name: "Monday at 10am",
    startTimeDayOfWeek: "1",
    startTimeHourOfDay: 10,
    start: DateTime.fromObject({ weekday: 1, hour: 10 })
      .plus({
        weeks: 1,
      })
      .toISO(),
    end: DateTime.fromObject({ weekday: 1, hour: 11 })
      .plus({
        weeks: 1,
      })
      .toISO(),
  },
  {
    name: "Tuesday at 10am",
    startTimeDayOfWeek: "2",
    startTimeHourOfDay: 10,
    start: DateTime.fromObject({ weekday: 2, hour: 10 })
      .plus({
        weeks: 1,
      })
      .toISO(),
    end: DateTime.fromObject({ weekday: 2, hour: 11 })
      .plus({
        weeks: 1,
      })
      .toISO(),
  },
  {
    name: "Tuesday at 6pm",
    startTimeDayOfWeek: "2",
    startTimeHourOfDay: 18,
    start: DateTime.fromObject({ weekday: 2, hour: 18 })
      .plus({
        weeks: 1,
      })
      .toISO(),
    end: DateTime.fromObject({ weekday: 2, hour: 19 })
      .plus({
        weeks: 1,
      })
      .toISO(),
  },
];

// Map test data to EventCreateInput objects
const mapTestDataToGraphQLInput = (
  events: TestEventData[]
): EventCreateInput[] => {
  return events.map((event: TestEventData) => {
    return {
      title: event.name,
      Channels: {
        connect: [
          {
            where: {
              node: {
                uniqueName: "cats",
              },
            },
          },
        ],
      },
      startTime: event.start,
      startTimeDayOfWeek: event.startTimeDayOfWeek,
      startTimeHourOfDay: event.startTimeHourOfDay,
      endTime: event.end,
      virtualEventUrl: "https://example.com",
      Poster: {
        connect: {
          where: {
            node: {
              username: "cluse",
            },
          },
        },
      },
      cost: "0",
      canceled: false,
    };
  });
};

describe("Filter events by weekdays and times", () => {
  beforeEach(function () {
    deleteAll();
    cy.seedEmails();
    cy.seedUsers();
    cy.seedChannels();

    cy.createEvents(mapTestDataToGraphQLInput(testEventData));
    cy.visit(ONLINE_EVENT_LIST);

    // wait for event list to load before testing filters
    cy.get('ul[data-testid="event-list"]').should("exist");
  });

  it("in the sitewide online events list, filters events by weekday", () => {
    cy.visit(ONLINE_EVENT_LIST);
    cy.get('button[data-testid="more-filters-button"]').click();

    cy.get('button[data-testid="show-advanced-button"]').click();

    // Click on the "Monday" checkbox
    cy.get('input[data-testid="weekday-1-checkbox"]').click();

    // Close filter drawer
    cy.get('button[data-testid="close-drawer-bottom-button"]').click();

    // should have one result
    cy.get('ul[data-testid="event-list"]').find("li").should("have.length", 1);

    // top result contains the event name
    cy.get('ul[data-testid="event-list"]')
      .find("li")
      .contains(testEventData[0].name);

    // Reopen the filter drawer
    cy.get('button[data-testid="more-filters-button"]').click();

    // Deselect the "Monday" checkbox
    cy.get('input[data-testid="weekday-1-checkbox"]').click();
    cy.wait(1000);

    // Click the "Tuesday" checkbox
    cy.get('input[data-testid="weekday-2-checkbox"]').click();
    cy.wait(1000);

    // Close the drawer again
    cy.get('button[data-testid="close-drawer-bottom-button"]').click();

    // should have two results
    cy.get('ul[data-testid="event-list"]').find("li").should("have.length", 2);
  });

  it("in the sitewide online events list, filters events by time of day", () => {
    cy.visit(ONLINE_EVENT_LIST);
    cy.get('button[data-testid="more-filters-button"]').click();

    cy.get('button[data-testid="show-advanced-button"]').click();

    // Click on the "6pm-9pm" checkbox
    cy.get('input[data-testid="timeRange-6pm-9pm"]').click();

    // Close filter drawer

    cy.get('button[data-testid="close-drawer-bottom-button"]').click();

    // should have one result
    cy.get('ul[data-testid="event-list"]').find("li").should("have.length", 1);
  });
});
