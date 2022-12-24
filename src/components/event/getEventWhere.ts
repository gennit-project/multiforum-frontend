import LocationFilterTypes from "./locationFilterTypes";
import { SearchEventValues } from "@/types/eventTypes";
import {
    hourRangesObject,
  } from "@/components/event/eventSearchOptions";

const getEventWhere = (filterValues: SearchEventValues, showMap: boolean) => {
    let conditions = [];

    const {
        beginningOfDateRangeISO,
        endOfDateRangeISO,
        radius,
        tags,
        channels,
        weeklyHourRanges,
        locationFilter,
        searchInput,
        showCanceledEvents,
        latitude,
        longitude,
        free,
    } = filterValues

    // Free event filter
    if (free) {
      conditions.push({ free: true });
    }

    // Text filter
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
          // If map view is shown, only include
          // events with both a physical location
          // and a virtual event url
          conditions.push({ location_NOT: null });
        }
        conditions.push({ virtualEventUrl_NOT: null });
        break;

      case LocationFilterTypes.WITHIN_RADIUS:
        if (
          radius &&
          latitude &&
          longitude
        ) {
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
      const matchTags = tags.reduce(
        (prev: any, curr: any) => {
          return prev.concat({ text_MATCHES: `(?i)${curr}` });
        },
        []
      );
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
    

    const flattenedTimeFilters: any = [] // rewrite to take query params

    if (flattenedTimeFilters.length > 0) {
      conditions.push({
        OR: flattenedTimeFilters
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
  }
  export default getEventWhere