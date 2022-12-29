import LocationFilterTypes from "./locationFilterTypes";
import { SearchEventValues } from "@/types/eventTypes";
import { SelectedWeeklyHourRanges } from "@/types/eventTypes";
import { hourRangesObject, weekdayObject } from "./eventSearchOptions";
// import {
//     hourRangesObject,
//   } from "@/components/event/eventSearchOptions";

// The purpose of this function is to convert event filter variables
// into the EventWhere input object as it is defined in the auto-generated GraphQL
// documentation for querying events.
const getEventWhere = (filterValues: SearchEventValues, showMap: boolean) => {
  const {
    beginningOfDateRangeISO,
    endOfDateRangeISO,
    radius,
    tags,
    channels,
    weekdays,
    hourRanges,
    weeklyHourRanges,
    locationFilter,
    searchInput,
    showCanceledEvents,
    latitude,
    longitude,
    free,
  } = filterValues;

  // These conditions will be added to the filter
  // object under an AND operator.
  let conditions = [];

  // Free event filter
  if (free) {
    conditions.push({ free: true });
  }

  // Text search filter
  if (searchInput) {
    conditions.push({
      OR: [
        {
          title_MATCHES: `(?i).*${searchInput}.*`,
        },
        {
          description_MATCHES: `(?i).*${searchInput}.*`,
        },
      ],
    });
  }

  // Location filter
  switch (locationFilter) {
    case LocationFilterTypes.NONE:
      if (showMap) {
        conditions.push({ location_NOT: null });
      }
      break;
    case LocationFilterTypes.ONLY_WITH_ADDRESS:
      // Filter by events that have a location
      // with coordinates
      conditions.push({ location_NOT: null });
      break;

    case LocationFilterTypes.ONLY_VIRTUAL:
      // Filter by events that have a virtual event URL
      if (showMap) {
        // If map view is shown and events are filtered
        // to show only virtual events, only include
        // events with both a physical location
        // and a virtual event url
        conditions.push({ location_NOT: null });
      }
      conditions.push({ virtualEventUrl_NOT: null });
      break;

    case LocationFilterTypes.WITHIN_RADIUS:
      if (radius && latitude && longitude) {
        // Filter for events within a radius of a reference point
        conditions.push({
          location_LTE: {
            point: {
              latitude,
              longitude,
            },
            distance: radius * 1000,
          },
        });
      }
  }

  // Tag filter
  if (tags.length > 0) {
    const matchTags = tags.reduce((prev: any, curr: any) => {
      return prev.concat({ text_MATCHES: `(?i)${curr}` });
    }, []);
    conditions.push({
      Tags: {
        OR: matchTags,
      },
    });
  }

  // Channel filter
  if (channels.length > 0) {
    const matchChannels = channels.reduce(
      // Technically a selected channel could be an array
      // of strings, but we expect it to always be a string.
      (prev: any, curr: any) => {
        return prev.concat({ uniqueName_MATCHES: `(?i)${curr}` });
      },
      []
    );
    conditions.push({
      Channels: {
        OR: matchChannels,
      },
    });
  }

  // Weekly time filter

  // The selected weekly time windows are in the
  // piece of state called selectedWeeklyHourRanges.
  // That data structure is an object where the keys
  // are weekdays and the values are objects where the
  // key is the time slot and the value is a boolean.

  // But to create a GraphQL query filter out of that,
  // this function flattens the structure.

  // The time filters will be nested under an OR operator
  // within the overarching AND operator.
  const flattenedTimeFilters: any[] = [];

  // Add selected weekdays to the list of filter objects.
  for (const weekday in weekdays) {
    if (weekdays[weekday]) {
      flattenedTimeFilters.push({
        startTimeDayOfWeek: weekday,
      });
    }
  }

  // Add selected hour ranges to the list of filter objects.
  for (const range in hourRanges) {
    if (hourRanges[range] === true && hourRangesObject[range] !== undefined) {
      // Due to the way that Neo4j works, it is faster
      // to check for specific hours that an event may
      // begin than it is to check for hour ranges
      // using greater-than or less-than operators.

      const max = hourRangesObject[range].max;
      const min = hourRangesObject[range].min;

      for (let i = min; i < max; i++) {
        flattenedTimeFilters.push({
          startTimeHourOfDay: i,
        });
      }
    }
  }

  // Add weekly hour ranges to the list of filter objects,
  // unless that day or hour range was already added.
  for (const weekday in weeklyHourRanges) {
    const rangeData = weeklyHourRanges[weekday];

    for (const hourRange in rangeData) {
      if (rangeData[hourRange] === true) {
        const max = hourRangesObject[hourRange].max;
        const min = hourRangesObject[hourRange].min;

        for (let hour = min; hour < max; hour++) {
          flattenedTimeFilters.push({
            AND: [
              {
                startTimeHourOfDay: hour,
              },
              {
                startTimeDayOfWeek: weekday,
              },
            ],
          });
        }
      }
    }
  }

  if (flattenedTimeFilters.length > 0) {
    conditions.push({
      OR: flattenedTimeFilters,
    });
  }

  return {
    AND: (conditions = [
      ...conditions,
      { canceled: showCanceledEvents },
      {
        ChannelsAggregate: {
          count_GT: 0,
        },
      },
      {
        startTime_GT: `${beginningOfDateRangeISO}`,
      },
      {
        startTime_LT: `${endOfDateRangeISO}`,
      },
    ]),
  };
};
export default getEventWhere;
