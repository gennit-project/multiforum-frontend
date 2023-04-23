import { SearchEventValues } from "@/types/eventTypes";
import { chronologicalOrder, reverseChronologicalOrder } from "./filterStrings";
import LocationFilterTypes from "./locationFilterTypes";
import {
  createDefaultSelectedWeeklyHourRanges,
  createDefaultSelectedHourRanges,
  createDefaultSelectedWeekdays,
  hourRangesObject,
} from "./eventSearchOptions";
import { timeShortcutValues } from "./eventSearchOptions";

import { resultOrderTypes } from "./eventSearchOptions";

const defaultPlace = {
  // Default map center is Tempe Public Library
  name: "Tempe Public Library",
  latitude: 33.39131450000001,
  longitude: -111.9280626,
  referencePointId: "ChIJR35tTZ8IK4cR2D0p0AxOqbg",
  address: "3500 S Rural Rd, Tempe, AZ 85282, USA",
};

const getFilterValuesFromParams = function (
  route: any,
  channelId: string
): SearchEventValues {
  // Need to re-clean data when route values change
  // Take the default filter values from the query
  // in the URL if the values exist.

  const cleanedValues: SearchEventValues = {};

  // For the online events list, only include
  // events with a virtual event URL.
  if (route?.name === "SitewideSearchEventPreview") {
    cleanedValues.hasVirtualEventUrl = true;
  }

  for (const key in route?.query || {}) {
    const val = route.query[key];

    switch (key) {
      case "timeShortcut":
        if (typeof val === "string") {
          cleanedValues.timeShortcut = val;
        }
        break;
      case "radius":
        cleanedValues.radius = parseFloat(val)
        break;
      case "latitude":
        if (typeof val === "number") {
          cleanedValues.latitude = val;
        }
        break;
      case "longitude":
        if (typeof val === "number") {
          cleanedValues.longitude = val;
        }
        break;
      case "tags":
        if (typeof val === "string") {
          cleanedValues.tags = [val];
        }
        if (typeof val === "object") {
          // If it is an array of strings, which
          // is good, then the type is an object.
          cleanedValues.tags = val;
        }
        break;
      case "channels":
        if (typeof val === "string") {
          cleanedValues.channels = [val];
        }
        if (typeof val === "object") {
          // If it is an array of strings, which
          // is good, then the type is an object.
          cleanedValues.channels = val;
        }
        break;
      case "searchInput":
        if (typeof val === "string") {
          cleanedValues.searchInput = val;
        }
        break;
      case "showCanceledEvents":
        // May need to cast to boolean
        if (typeof val === "boolean") {
          cleanedValues.showCanceledEvents = val;
        }
        break;
      case "free":
        if (typeof val === "boolean") {
          cleanedValues.free = val;
        }
        break;
      case "resultsOrder":
        if (val === resultOrderTypes.CHRONOLOGICAL) {
          cleanedValues.resultsOrder = chronologicalOrder;
        }
        if (val === resultOrderTypes.REVERSE_CHRONOLOGICAL) {
          cleanedValues.resultsOrder = reverseChronologicalOrder;
        }
        break;
      case "locationFilter":
        cleanedValues.locationFilter = val?.toString();
        break;
      case "weekdays":
        // Example value: weekdays=[{"startTimeDayOfWeek":"1"}]
        try {
          const weekdaysInQuery = JSON.parse(val);
          cleanedValues.weekdays = createDefaultSelectedWeekdays();

          for (let i = 0; i < weekdaysInQuery.length; i++) {
            const obj = weekdaysInQuery[i];

            if (obj && obj.startTimeDayOfWeek) {
              cleanedValues.weekdays[obj.startTimeDayOfWeek] = true;
            }
          }
        } catch (e: any) {
          throw new Error(e);
        }
        break;
      case "hourRanges":
        // Example value: hourRanges=[{"startTimeHourOfDay":"3am-6am"}]
        try {
          const hourRanges = JSON.parse(val);

          cleanedValues.hourRanges = createDefaultSelectedHourRanges();

          for (let i = 0; i < hourRanges.length; i++) {
            const obj = hourRanges[i];

            if (
              obj &&
              obj.startTimeHourOfDay !== undefined &&
              hourRangesObject[obj.startTimeHourOfDay]
            ) {
              // Due to the way that Neo4j works, it is faster
              // to check for specific hours that an event may
              // begin than it is to check for hour ranges
              // using greater-than or less-than operators.

              cleanedValues.hourRanges[obj.startTimeHourOfDay] = true;
            }
          }
        } catch (e: any) {
          throw new Error(e);
        }
        break;
      case "weeklyHourRanges":
        // Example value: weeklyHourRanges=[{"AND":[{"startTimeHourOfDay":"3am-6am"},{"startTimeDayOfWeek":"4"}]}]
        try {
          const weeklyHourRangesInQuery = JSON.parse(val);

          cleanedValues.weeklyHourRanges =
            createDefaultSelectedWeeklyHourRanges();

          for (let i = 0; i < weeklyHourRangesInQuery.length; i++) {
            const obj = weeklyHourRangesInQuery[i];
            const objConditions = obj.AND;
            const hourOfDay = objConditions[0]?.startTimeHourOfDay;
            const dayOfWeek = objConditions[1]?.startTimeDayOfWeek;

            cleanedValues.weeklyHourRanges[dayOfWeek][hourOfDay] = true;
          }
        } catch (e: any) {
          throw new Error(e);
        }
        break;
    }
  }

  const {
    timeShortcut,
    radius,
    latitude,
    longitude,
    tags,
    channels,
    searchInput,
    showCanceledEvents,
    free,
    weekdays,
    hourRanges,
    weeklyHourRanges,
    resultsOrder,
    locationFilter,
    hasVirtualEventUrl,
  } = cleanedValues;

  return {
    timeShortcut: timeShortcut || timeShortcutValues.NONE,
    radius: radius || 160.934,
    latitude: latitude || defaultPlace.latitude,
    longitude: longitude || defaultPlace.longitude,
    tags: tags || [],
    channels: channels || [],
    searchInput: searchInput || "",
    showCanceledEvents: showCanceledEvents || false,
    free: free || false,
    weekdays: weekdays || createDefaultSelectedWeekdays(),
    hourRanges: hourRanges || createDefaultSelectedHourRanges(),
    weeklyHourRanges:
      weeklyHourRanges || createDefaultSelectedWeeklyHourRanges(),
    resultsOrder: resultsOrder || chronologicalOrder,
    locationFilter:
      // If there is a location filter in the query params,
      // use it. Within a channel, don't filter by distance.
      // If we are listing virtual events, don't filter by distance.
      locationFilter ||
      (channelId || hasVirtualEventUrl
        ? LocationFilterTypes.NONE
        : LocationFilterTypes.WITHIN_RADIUS),
    hasVirtualEventUrl: hasVirtualEventUrl || false,
  };
};

export { getFilterValuesFromParams, defaultPlace };
