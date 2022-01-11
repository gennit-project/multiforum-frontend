<script lang="ts">
import { defineComponent, computed, PropType, ref } from "vue";

import { gql } from "@apollo/client/core";
import { useQuery } from "@vue/apollo-composable";
import { GET_CHANNEL_NAMES } from "@/graphQLData/channel/queries";
import { GET_TAGS } from "@/graphQLData/tag/queries";

import AddToFeed from "../buttons/AddToFeed.vue";
import ChannelPicker from "@/components/forms/ChannelPicker.vue";
import DatePicker from "@/components/forms/DatePicker.vue";
import EventList from "./EventList.vue";
import EventPreview from "./EventPreview.vue";
import LocationIcon from "../icons/LocationIcon.vue";
import LocationSearchBar from "@/components/event/LocationSearchBar.vue";
import LocationPicker from "@/components/event/LocationPicker.vue";
import Map from "./Map.vue";
import PreviewContainer from "./PreviewContainer.vue";
import TagPicker from "@/components/forms/TagPicker.vue";
import ToggleMap from "../buttons/ToggleMap.vue";
import SearchBar from "../forms/SearchBar.vue";
import WeeklyTimePicker from "@/components/event/WeeklyTimePicker.vue";
import FilterChip from "@/components/forms/FilterChip.vue";
import FilterIcon from "../icons/FilterIcon.vue";
import CalendarIcon from "../icons/CalendarIcon.vue";
import ChannelIcon from "../icons/ChannelIcon.vue";
import TagIcon from "../icons/TagIcon.vue";
import TimeIcon from "../icons/TimeIcon.vue";
import CloseButton from "@/components/buttons/CloseButton.vue";
import dateRangeTypes from "@/components/event/dateRangeTypes";
import locationFilterTypes from "@/components/event/locationFilterTypes";
import CreateEventButton from "@/components/buttons/CreateEvent.vue";

import {
  defaultSelectedWeekdays,
  defaultSelectedHourRanges,
  defaultSelectedWeeklyHourRanges,
  hourRangesObject,
  locationFilterOptions,
  weekdayObject,
  distanceOptions,
  distanceUnitOptions,
} from "@/components/event/eventSearchOptions";
import { getTagLabel, getChannelLabel } from "@/components/forms/utils";
import { router } from "@/router";
import { useRoute } from "vue-router";

import {
  EventData,
  WeekdayData,
  HourRangeData,
  SelectedWeekdays,
  SelectedHourRanges,
  SelectedWeeklyHourRanges,
  ReferencePoint,
} from "@/types/eventTypes";
import { TagData } from "@/types/tagTypes.d";
import { ChannelData } from "@/types/channelTypes.d";

const { DateTime } = require("luxon");

interface Ref<T> {
  value: T;
}

export default defineComponent({
  name: "SearchEvents",
  components: {
    AddToFeed,
    CalendarIcon,
    ChannelIcon,
    ChannelPicker,
    CloseButton,
    CreateEventButton,
    DatePicker,
    EventList,
    EventPreview,
    FilterChip,
    FilterIcon,
    LocationIcon,
    LocationSearchBar,
    LocationPicker,
    Map,
    PreviewContainer,
    TagIcon,
    TagPicker,
    TimeIcon,
    ToggleMap,
    SearchBar,
    WeeklyTimePicker,
  },
  setup(props) {
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId;
    });

    const selectedTags: Ref<Array<string>> = ref(props.routerTags);

    const getDefaultSelectedChannels = () => {
      if (channelId.value) {
        return [channelId.value]
      }
      return props.routerChannels
    }

    const selectedChannels: any = ref(getDefaultSelectedChannels());
    const searchInput: Ref<string> = ref("");

    // Variables for the order of the results
    const chronologicalOrder = "{ asc: startTime }";
    const reverseChronologicalOrder = "{ desc: startTime }";

    const now = DateTime.now();
    const nowISO = now.toISO();
    const defaultStartDateObj = now.startOf("day");
    const defaultStartDateISO = defaultStartDateObj.toISO();
    const defaultEndDateRangeObj = defaultStartDateObj.plus({ days: 14 });
    const defaultEndDateRangeISO = defaultEndDateRangeObj.toISO();

    const dateRange = ref(dateRangeTypes.FUTURE);

    const futureEventsFilter = `gt: "${nowISO}"`;
    const pastEventsFilter = `lt: "${nowISO}"`;

    const startTimeFilter = ref(futureEventsFilter);
    const resultsOrder = ref(chronologicalOrder);
    const beginningOfDateRange = ref(defaultStartDateISO);
    const endOfDateRange = ref(defaultEndDateRangeISO);
    const betweenDateTimesFilter = computed(() => {
      return `between: { min: "${beginningOfDateRange.value}", max: "${endOfDateRange.value}"}`;
    });

    const defaultReferencePoint = {
      lat: 33.4255,
      lng: -111.94,
    } as ReferencePoint;
    const referencePoint = ref(defaultReferencePoint);

    const defaultDistanceUnit = distanceUnitOptions[0].value;
    const distanceUnit = ref(defaultDistanceUnit);

    const defaultRadius = distanceOptions[0].km;
    const radius = ref(defaultRadius);
    const referencePointAddress = ref("");
    const referencePointName = ref("");

    let showOnlyFreeEvents = ref(false);

    let freeEventFilter = computed(() => {
      if (!showOnlyFreeEvents.value) {
        return "";
      }
      return `,
        cost: {
          eq: "0"
        }
      `;
    });

    let textFilter = computed(() => {
      if (!searchInput.value) {
        return "";
      }
      return `,
      { 
        or: [ 
          { title: { alloftext: "${searchInput.value}" } },
          { description: { alloftext: "${searchInput.value}" } }
        ]
      },
      `;
    });

    let selectedLocationFilter = ref(locationFilterOptions[0].value);

    let locationFilter = computed(() => {
      switch (selectedLocationFilter.value) {
        case locationFilterTypes.NONE:
          return "";
        case locationFilterTypes.ONLY_WITH_ADDRESS:
          // Filter by events that have a location
          // with coordinates
          return "has: location";

        case locationFilterTypes.ONLY_VIRTUAL:
          // Filter by events that have a virtual event URL
          return "has: virtualEventUrl";

        case locationFilterTypes.WITHIN_RADIUS:
          if (
            radius.value &&
            referencePoint.value &&
            referencePointAddress.value
          ) {
            // Filter for events within a radius of a reference point
            return `location: { 
              near: { 
                coordinate: { 
                  latitude: ${referencePoint.value.lat}, 
                  longitude: ${referencePoint.value.lng}}, 
                  distance: ${radius.value * 1000}
                }
              }`;
          }
          return "";
        default:
          return "";
      }
    });

    // By default, no weekdays or hour ranges are selected.
    let selectedWeekdays: Ref<SelectedWeekdays> = ref(defaultSelectedWeekdays);
    let selectedHourRanges: Ref<SelectedHourRanges> = ref(
      defaultSelectedHourRanges
    );
    let selectedWeeklyHourRanges: Ref<SelectedWeeklyHourRanges> = ref(
      defaultSelectedWeeklyHourRanges
    );

    const weeklyTimeRangeFilter = computed(() => {
      // The selected weekly time windows are in the
      // piece of state called selectedWeeklyHourRanges.
      // That data structure is an object where the keys
      // are weekdays and the values are objects where the
      // key is the time slot and the value is a boolean.

      // But to create a GraphQL query filter out of that,
      // this function flattens the structure so that the
      // filter will look something like this:

      // and: {
      //   or: [
      //   {
      //     startTimeHourOfDay: {
      //         between: {
      //           min: 3,
      //           max: 6
      //         }
      //     },
      //     startTimeDayOfWeek: {
      //       allofterms: "Thursday"
      //     }
      //   },
      //   {
      //     startTimeHourOfDay: {
      //       between: {
      //         min: 0,
      //         max: 3
      //       }
      //     },
      //     startTimeDayOfWeek: {
      //       allofterms: "Friday"
      //     }
      //   }
      //   ]
      // }

      let flattened = "";
      for (let dayNumber in selectedWeeklyHourRanges.value) {
        const selectedSlotsInDay = selectedWeeklyHourRanges.value[dayNumber];

        for (let timeSlot in selectedSlotsInDay) {
          const slotIsSelected = selectedSlotsInDay[timeSlot];

          if (slotIsSelected) {
            flattened = flattened.concat(`{
                startTimeHourOfDay: {
                  between: {
                    min: ${hourRangesObject[timeSlot].min},
                    max: ${hourRangesObject[timeSlot].max}
                  }
                },
                startTimeDayOfWeek: {
                  allofterms: "${weekdayObject[dayNumber]}"
                }
              },`);
          }
        }
      }

      if (flattened === "") {
        return "";
      }
      let timeSlotFilter = `{
          or: [
            ${flattened}
          ]
        }`;
      return timeSlotFilter;
    });

    let needsCascade = computed(() => {
      return selectedChannels.value.length > 0 || selectedTags.value.length > 0;
    });

    let cascadeText = computed(() => {
      // Adding parameters to @cascade makes it so that
      // even when we are filtering by
      // channels or tags, we can still see the events that
      // don't have all the fields that we want. Normally,
      // @cascade would filter
      // out all items that don't have all of the described
      // output fields.
      // If we are filtering by channel but not by tag,
      // we include only the channel field in the cascade parameters.
      // If the tags parameter was included, events in the
      // selected channel would be excluded for not having tags.
      return `@cascade(fields: [${
        selectedTags.value.length > 0 ? `"Tags",` : ""
      } "Channels"])`;
    });

    let filterString = computed(() => {
      return `(
          order: ${resultsOrder.value},
          offset: $offset, 
          first: $first, 
          filter: {
            startTime: {
              ${startTimeFilter.value}
            }
            ${freeEventFilter.value}
            ${
              textFilter.value || weeklyTimeRangeFilter.value
                ? `
            and: [${textFilter.value} ${weeklyTimeRangeFilter.value}]
            `
                : ""
            }
            ${locationFilter.value}
          }
      ) ${needsCascade.value ? cascadeText.value : ""}`;
    });

    let channelFilter = computed(() => {
      return `(filter: { url: { anyofterms: "${selectedChannels.value.join(
        " "
      )}"}})`;
    });
    let tagFilter = computed(() => {
      return `(filter: { text: { anyofterms: "${selectedTags.value.join(
        " "
      )}" }})`;
    });
    const updateRouterQueryParams = () => {
      router.push({
        path: "/events",
        query: {
          search: searchInput.value,
          channel: selectedChannels.value,
          tag: selectedTags.value,
        },
      });
    };

    const setSearchInput = (input: string) => {
      searchInput.value = input;
      updateRouterQueryParams();
    };
    const setTagFilters = (tag: Array<string>) => {
      selectedTags.value = tag;
      updateRouterQueryParams();
    };
    const setChannelFilters = (channel: Array<string>) => {
      selectedChannels.value = channel;
      updateRouterQueryParams();
    };

    let eventQueryString = computed(() => {
      return `
        query getEvents ($first: Int, $offset: Int){
          queryEvent ${filterString.value}{
            id
            Channels ${
              selectedChannels.value.length > 0 ? channelFilter.value : ""
            }{
              url
            }
            title
            description
            startTime
            endTime
            locationName
            address
            virtualEventUrl
            location {
              latitude
              longitude
            }
            cost
            Poster {
              username
            }
            Tags ${selectedTags.value.length > 0 ? tagFilter.value : ""}{
              text
            }
            CommentSections {
              id
              CommentsAggregate {
                count
              }
              Discussion {
                id
              }
              Event {
                id
              }
              Channel {
                url
              }
            }
          }
        }
        `;
    });

    // Turn the query string into an actual GraphQL
    // query. Any GraphQL syntax errors will be thrown here.
    let eventQuery = computed(() => {
      try {
        return gql`
          ${eventQueryString.value}
        `;
      } catch (err) {
        throw new Error(err);
      }
    });

    const {
      result: eventResult,
      loading: eventLoading,
      refetch: refetchEvents,
      fetchMore,
    } = useQuery(eventQuery, { first: 20, offset: 0 });

    const reachedEndOfResults = ref(false);

    const loadMore = () => {
      fetchMore({
        variables: {
          offset: eventResult.value.queryEvent.length,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (fetchMoreResult.queryEvent.length === 0) {
            reachedEndOfResults.value = true;
            return prev;
          }
          return {
            ...prev,
            queryEvent: [...prev.queryEvent, ...fetchMoreResult.queryEvent],
          };
        },
      });
    };

    const { result: tagOptions } = useQuery(GET_TAGS);
    const { result: channelOptions } = useQuery(GET_CHANNEL_NAMES);

    const channelLabel = computed(() => {
      return getChannelLabel(selectedChannels.value)
    });

    const tagLabel = computed(() => {
      return getTagLabel(selectedTags.value)
    });

    const locationLabel = computed(() => {
      let distance = "";
      switch (selectedLocationFilter.value) {
        case locationFilterTypes.WITHIN_RADIUS:
          if (distanceUnit.value === "km") {
            distance = radius.value;
          } else if (distanceUnit.value === "mi") {
            distance = (radius.value * 0.62137).toFixed(1);
          }
          if (
            referencePoint.value &&
            referencePointAddress.value &&
            referencePointName.value
          ) {
            return `Within ${distance} ${distanceUnit.value} of ${referencePointName.value}`;
          } else if (referencePointAddress.value) {
            return `Within ${distance} ${distanceUnit.value} of ${referencePointAddress.value}`;
          } else {
            return "Location";
          }
        case locationFilterTypes.ONLY_WITH_ADDRESS:
          return "In-person only";
        case locationFilterTypes.ONLY_VIRTUAL:
          return "Virtual only";
        default:
          return "Location";
      }
    });

    const dateLabel = computed(() => {
      if (dateRange.value === dateRangeTypes.FUTURE) {
        return `Future Events`;
      } else if (dateRange.value === dateRangeTypes.PAST) {
        return `Past Events`;
      } else if (dateRange.value === dateRangeTypes.BETWEEN_TWO_DATES) {
        const startDateObject = new DateTime.fromISO(
          beginningOfDateRange.value
        );
        const endDateObject = new DateTime.fromISO(endOfDateRange.value);
        const formattedStartDate = startDateObject.toLocaleString(
          DateTime.DATE_MED
        );
        const formattedEndDate = endDateObject.toLocaleString(
          DateTime.DATE_MED
        );
        return `From ${formattedStartDate} to ${formattedEndDate}`;
      } else {
        return "";
      }
    });

    const otherFiltersLabel = computed(() => {
      if (!searchInput.value && !showOnlyFreeEvents.value) {
        return "Other Filters";
      }
      let labels = [];
      if (searchInput.value) {
        labels.push(searchInput.value);
      }
      if (showOnlyFreeEvents.value) {
        labels.push("free");
      }
      const labelString = labels.join(", ");
      return `Other Filters: ${labelString}`;
    });

    return {
      channelId,
      beginningOfDateRange,
      betweenDateTimesFilter,
      channelLabel,
      channelOptions,
      chronologicalOrder,
      dateLabel,
      dateRange,
      defaultEndDateRangeISO,
      defaultSelectedHourRanges,
      defaultStartDateISO,
      distanceUnit,
      endOfDateRange,
      eventLoading,
      eventQuery,
      eventQueryString,
      eventResult,
      filterString,
      futureEventsFilter,
      loadMore,
      locationLabel,
      locationFilter,
      otherFiltersLabel,
      radius,
      reachedEndOfResults,
      refetchEvents,
      referencePoint,
      referencePointAddress,
      referencePointName,
      resultsOrder,
      reverseChronologicalOrder,
      router,
      pastEventsFilter,
      placeData: null,
      showOnlyFreeEvents,
      searchInput,
      selectedHourRanges,
      selectedWeekdays,
      selectedWeeklyHourRanges,
      setSearchInput,
      setChannelFilters,
      setTagFilters,
      selectedChannels,
      selectedLocationFilter,
      selectedTags,
      startTimeFilter,
      tagLabel,
      tagOptions,
      weeklyTimeRangeFilter,
    };
  },
  data(props) {
    let showMap = false;
    if (props.routerView === "map") {
      showMap = true;
    }
    return {
      showMap,
      eventPreviewIsOpen: false,
      multipleEventPreviewIsOpen: false,
      selectedEvent: null as EventData | null,
      selectedEvents: [],
      highlightedEventLocationId: "",
      highlightedEventId: "",
      highlightedMarker: null,
      colorLocked: false,
      markerMap: {} as any,
      map: {} as any,
    };
  },
  props: {
    routerTags: {
      type: Array as PropType<Array<string>>,
      default: () => {
        return [];
      },
    },
    routerChannels: {
      type: Array as PropType<Array<string>>,
      default: () => {
        return [];
      },
    },
    routerSearchTerms: {
      type: String,
      default: "",
    },
    routerView: {
      type: String,
      default: "",
    },
  },
  methods: {
    highlightEvent(
      eventLocationId: string,
      eventId: string,
      eventData: EventData,
      clickedMapMarker: boolean | false
    ) {
      router.push(`#${eventLocationId}`);
      this.highlightedEventLocationId = eventLocationId;

      if (eventId) {
        if (
          this.markerMap[eventLocationId] &&
          this.markerMap[eventLocationId].events[eventId]
        ) {
          this.selectedEvent = this.markerMap[eventLocationId].events[eventId];
        } else if (eventData) {
          this.selectedEvent = eventData;
        } else {
          throw new Error("Could not find the event data.");
        }
      }

      if (this.markerMap[eventLocationId]) {
        this.markerMap[eventLocationId].marker.setIcon({
          url: require("@/assets/images/highlighted-place-icon.svg").default,
          scaledSize: { width: 20, height: 20 },
        });

        const openSpecificInfowindow = () => {
          const eventTitle = this.markerMap[eventLocationId].events[
            this.highlightedEventId
          ].title;
          const eventLocation = this.markerMap[eventLocationId].events[
            this.highlightedEventId
          ].locationName;

          let infowindowContent = `<b>${eventTitle}</b>`;

          if (eventLocation) {
            infowindowContent = `<div style="text-align:center"><b>${eventTitle}</b></div></div><div style="text-align:center">at ${eventLocation}</div>`;
          }
          this.markerMap.infowindow.setContent(infowindowContent);
          this.markerMap.infowindow.open({
            anchor: this.markerMap[eventLocationId].marker,
            map: this.map,
            shouldFocus: false,
          });
        };

        const openGenericInfowindow = () => {
          this.markerMap.infowindow.setContent(`${numberOfEvents} events`);
          this.markerMap.infowindow.open({
            anchor: this.markerMap[eventLocationId].marker,
            map: this.map,
            shouldFocus: false,
          });
        };

        const numberOfEvents = this.markerMap[eventLocationId].numberOfEvents;

        // If the user mouses over a map marker with multiple events,
        // open a generic infowindow.
        if (clickedMapMarker && numberOfEvents > 1) {
          openGenericInfowindow();
        }

        // If the user mouses over a map marker with a single event,
        // open a specific infowindow.
        else if (clickedMapMarker && numberOfEvents === 1) {
          const defaultEventId = Object.keys(
            this.markerMap[eventLocationId].events
          )[0];
          this.highlightedEventId = defaultEventId;
          openSpecificInfowindow();
        }

        // If the user mouses over an event list item in the event list,
        // always open a specific infowindow.
        else if (eventId) {
          this.highlightedEventId = eventId;
          openSpecificInfowindow();
        }

        if (numberOfEvents > 1) {
          const selectedEventsObject = this.markerMap[eventLocationId].events;
          const getArrayFromObject = (obj: any) => {
            const ary = [];

            for (let key in obj) {
              ary.push(obj[key]);
            }

            return ary;
          };
          const selectedEventsArray = getArrayFromObject(selectedEventsObject);

          this.selectedEvents = selectedEventsArray;
        }
      }
    },
    unhighlight() {
      if (!this.colorLocked) {
        if (this.markerMap.infowindow) {
          this.markerMap.infowindow.close();
        }

        if (this.markerMap[this.highlightedEventLocationId]) {
          this.markerMap[this.highlightedEventLocationId].marker.setIcon({
            url: require("@/assets/images/place-icon.svg").default,
            scaledSize: { width: 20, height: 20 },
          });
        }
        this.highlightedEventId = "";
        this.highlightedEventLocationId = "";
      }
    },
    closeEventPreview() {
      this.eventPreviewIsOpen = false;

      if (!this.multipleEventPreviewIsOpen) {
        this.colorLocked = false;
      }

      this.unhighlight();
    },
    closeMultipleEventPreview() {
      this.multipleEventPreviewIsOpen = false;
      this.colorLocked = false;
      this.unhighlight();
    },
    openPreview(event: EventData, openedFromMap: boolean | false) {
      if (openedFromMap) {
        // When opening from a map, count how
        // many events are at the clicked location.
        // If there is one event, open the preview for
        // that event. If there is more than one,
        // open a preview for multiple events.
        const eventsAtClickedLocation = this.markerMap[
          this.highlightedEventLocationId
        ].numberOfEvents;

        if (eventsAtClickedLocation > 1) {
          this.multipleEventPreviewIsOpen = true;
        } else {
          this.eventPreviewIsOpen = true;
        }
      } else {
        // If opened from a list,
        // always preview a specific event.
        this.eventPreviewIsOpen = true;
      }
      this.selectedEvent = event;
      this.colorLocked = true;
    },
    getTagOptionLabels(options: Array<TagData>) {
      return options.map((tag) => tag.text);
    },
    getChannelOptionLabels(options: Array<ChannelData>) {
      return options.map((channel) => channel.url);
    },
    updateSearchResult(input: string) {
      this.setSearchInput(input);
    },
    updateMapCenter(placeData: any) {
      if (this.showMap) {
        const lat = placeData.geometry.location.lat();
        const lng = placeData.geometry.location.lng();

        this.map.setCenter({
          lng,
          lat,
        });
      }
    },
    filterByTag(tag: string) {
      this.setTagFilters([tag]);
    },
    setMarkerData(data: any) {
      this.markerMap = data.markerMap;
      this.map = data.map;
    },
    setShowMap() {
      this.showMap = true;
      const path = this.channelId ? `/channels/${this.channelId}/events` : "events";
      router.push({
        path,
        query: {
          search: this.searchInput.value,
          channel: this.selectedChannels.value,
          tag: this.selectedTags.value,
          view: "map",
        },
      });
    },
    setShowList() {
      this.showMap = false;
      const path = this.channelId ? `/channels/${this.channelId}/events` : "events";
      router.push({
        path,
        query: {
          search: this.searchInput.value,
          channel: this.selectedChannels.value,
          tag: this.selectedTags.value,
          view: "list",
        },
      });
    },
    updateDateFilter(selectedDateRange: string, range: any) {
      this.dateRange = selectedDateRange;

      if (selectedDateRange === dateRangeTypes.FUTURE) {
        this.resultsOrder = this.chronologicalOrder;
        this.startTimeFilter = this.futureEventsFilter;
      }
      if (selectedDateRange === dateRangeTypes.PAST) {
        this.resultsOrder = this.reverseChronologicalOrder;
        this.startTimeFilter = this.pastEventsFilter;
      }
      if (selectedDateRange === dateRangeTypes.BETWEEN_TWO_DATES) {
        this.resultsOrder = this.chronologicalOrder;
        this.startTimeFilter = this.betweenDateTimesFilter;
        if (range) {
          const start = new Date(range.start).toISOString();
          this.beginningOfDateRange = start;

          const end = new Date(range.end).toISOString();
          this.endOfDateRange = end;
        }
      }
    },
    removeWeekday(day: WeekdayData) {
      this.selectedWeekdays[day.number] = false;

      const timeSlotsToRemove = Object.keys(this.defaultSelectedHourRanges);

      for (let i = 0; i < timeSlotsToRemove.length; i++) {
        const timeSlot = timeSlotsToRemove[i];

        // Leave the input enabled if it was locked in place
        // by highlighting the same weekday for every time slot.
        if (!this.selectedHourRanges[timeSlot] === true) {
          this.selectedWeeklyHourRanges[day.number][timeSlot] = false;
        }
      }
    },
    addWeekday(day: WeekdayData) {
      this.selectedWeekdays[day.number] = true;

      const timeSlotsToAdd = Object.keys(this.defaultSelectedHourRanges);

      for (let i = 0; i < timeSlotsToAdd.length; i++) {
        const timeSlot = timeSlotsToAdd[i];
        this.selectedWeeklyHourRanges[day.number][timeSlot] = true;
      }
    },
    toggleSelectWeekday(day: WeekdayData) {
      // This function makes it so that when an
      // entire weekday column
      // is selected with a checkbox in the form
      // for selecting availability windows, it applies
      // the weekday filter.
      if (this.selectedWeekdays[day.number]) {
        this.removeWeekday(day);
      } else {
        this.addWeekday(day);
      }
    },
    removeTimeRange(timeRange: HourRangeData) {
      const label = timeRange["12-hour-label"];
      this.selectedHourRanges[label] = false;

      for (let weekday in this.selectedWeeklyHourRanges) {
        // Leave the input enabled if it was locked in place
        // by highlighting the same time slot for the whole week.
        if (!this.selectedWeekdays[weekday] === true) {
          this.selectedWeeklyHourRanges[weekday][label] = false;
        }
      }
    },
    addTimeRange(timeRange: HourRangeData) {
      const label = timeRange["12-hour-label"];
      this.selectedHourRanges[label] = true;

      for (let weekday in this.selectedWeeklyHourRanges) {
        this.selectedWeeklyHourRanges[weekday][label] = true;
      }
    },
    toggleSelectTimeRange(timeRange: HourRangeData) {
      // This function makes it so that when an
      // entire time range range row is selected with
      // a checkbox in the form for selecting
      // availability windows, it applies to the
      // time range filter.
      const label = timeRange["12-hour-label"];
      if (this.selectedHourRanges[label]) {
        this.removeTimeRange(timeRange);
      } else {
        this.addTimeRange(timeRange);
      }
    },
    selectWeeklyTimeRange(day: string, timeRange: HourRangeData) {
      this.selectedWeeklyHourRanges[day][timeRange["12-hour-label"]] = true;
    },
    deselectWeeklyTimeRange(day: string, timeRange: HourRangeData) {
      this.selectedWeeklyHourRanges[day][timeRange["12-hour-label"]] = false;
    },
    toggleWeeklyTimeRange(dayNumber: string, timeRange: HourRangeData) {
      // This function selects time ranges based on the
      // check boxes in individual table cells where each
      // row is a time range and each column is a weekday.
      // We keep track of the selected weekly time ranges
      // in an object data structure to prevent duplicates.
      const timeRangeName = timeRange["12-hour-label"];

      if (this.selectedWeeklyHourRanges[dayNumber][timeRangeName]) {
        this.deselectWeeklyTimeRange(dayNumber, timeRange);
      } else {
        this.selectWeeklyTimeRange(dayNumber, timeRange);
      }
    },
    updateLocationFilter(selectedLocationFilter: string) {
      this.selectedLocationFilter = selectedLocationFilter;
    },
    filterByRadius(placeData: any) {
      const lat = placeData.geometry.location.lat();
      const lng = placeData.geometry.location.lng();
      const referencePoint = {
        lat,
        lng,
      };
      this.referencePoint = referencePoint;
      const referencePointAddress = placeData.formatted_address;

      if (placeData.name) {
        this.referencePointName = placeData.name;
      }
      this.referencePointAddress = referencePointAddress;
    },
    updateRadius(radius: Number) {
      this.radius = radius;
    },
    updateDistanceUnit(unit: String) {
      this.distanceUnit = unit;
    },
    updateLocationInput(placeData: any) {
      this.updateMapCenter(placeData);
      this.filterByRadius(placeData);
      this.placeData = placeData; // Use for debugging
      this.selectedLocationFilter = locationFilterTypes.WITHIN_RADIUS;
    },
  },
});
</script>
<template>
  <div>
    <div
      class="items-center mt-2 space-x-2 px-8"
    >
      <LocationSearchBar
        :router-search-terms="routerSearchTerms"
        :search-placeholder="'Location'"
        :reference-point-address-name="referencePointName"
        @updateLocationInput="updateLocationInput"
      />
      <ToggleMap
        :show-map="showMap"
        @showMap="setShowMap"
        @showList="setShowList"
      />
      <AddToFeed v-if="channelId" />
      <CreateEventButton/>
    </div>
    <div class="items-center mt-1 space-x-2 px-8">
      <FilterChip :label="dateLabel">
        <template v-slot:icon>
          <CalendarIcon />
        </template>
        <template v-slot:content>
          <DatePicker
            :end-iso="endOfDateRange"
            :start-iso="beginningOfDateRange"
            :date-range="dateRange"
            @updateDateFilter="updateDateFilter"
          />
        </template>
      </FilterChip>

      <FilterChip :label="locationLabel">
        <template v-slot:icon>
          <LocationIcon />
        </template>
        <template v-slot:content>
          <LocationPicker
            :selected-location-filter="selectedLocationFilter"
            :reference-point-address-name="referencePointName"
            @updateLocationFilter="updateLocationFilter"
            @updateLocationInput="updateLocationInput"
            @updateDistanceUnit="updateDistanceUnit"
            @updateRadius="updateRadius"
          />
        </template>
      </FilterChip>

      <FilterChip :label="'Weekday & Time'">
        <template v-slot:icon>
          <TimeIcon />
        </template>
        <template v-slot:content>
          <WeeklyTimePicker
            :selected-weekdays="selectedWeekdays"
            :selected-hour-ranges="selectedHourRanges"
            :selected-weekly-hour-ranges="selectedWeeklyHourRanges"
            @toggleSelectWeekday="toggleSelectWeekday"
            @toggleSelectTimeRange="toggleSelectTimeRange"
            @toggleWeeklyTimeRange="toggleWeeklyTimeRange"
          />
        </template>
      </FilterChip>

      <FilterChip v-if="!channelId" :label="channelLabel">
        <template v-slot:icon>
          <ChannelIcon />
        </template>
        <template v-slot:content>
          <ChannelPicker
            v-model="selectedChannels"
            :channel-options="
              getChannelOptionLabels(channelOptions.queryChannel)
            "
            :selected-channels="selectedChannels"
            @setChannelFilters="setChannelFilters"
          />
        </template>
      </FilterChip>

      <FilterChip :label="tagLabel">
        <template v-slot:icon>
          <TagIcon />
        </template>
        <template v-slot:content>
          <TagPicker
            :tag-options="getTagOptionLabels(tagOptions.queryTag)"
            :selected-tags="selectedTags"
            @setTagFilters="setTagFilters"
          />
        </template>
      </FilterChip>

      <FilterChip :label="otherFiltersLabel">
        <template v-slot:icon>
          <FilterIcon />
        </template>
        <template v-slot:content>
          <div>
            <label
              for="location"
              class="block text-sm font-medium text-gray-700"
              >Search Event Titles and Descriptions</label
            >

            <SearchBar
              :router-search-terms="routerSearchTerms"
              :search-placeholder="'Search'"
              @updateSearchInput="updateSearchResult"
            />

            <div class="relative flex items-start mt-4">
              <div class="flex items-center h-5">
                <input
                  class="
                    focus:ring-indigo-500
                    h-4
                    w-4
                    text-indigo-600
                    border-gray-300
                    rounded
                  "
                  type="checkbox"
                  id="onlyFreeEvents"
                  v-model="showOnlyFreeEvents"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="comments" class="font-medium text-gray-700"
                  >Show Only Free Events</label
                >
              </div>
            </div>
          </div>
        </template>
      </FilterChip>
    </div>

    <EventList
      id="listView"
      v-if="!showMap && eventResult && eventResult.queryEvent"
      :class="[!channelId ? 'px-8' : '']"
      class="relative text-lg max-w-6xl"
      :events="eventResult.queryEvent"
      :channel-id="channelId"
      :search-input="searchInput"
      :selected-tags="selectedTags"
      :selected-channels="selectedChannels"
      :highlighted-event-id="highlightedEventId"
      :show-map="showMap"
      @filterByTag="filterByTag"
      @open-preview="openPreview"
      @unhighlight="unhighlight"
    />
    <div
      v-if="!showMap && eventResult && eventResult.queryEvent"
      class="grid justify-items-stretch"
    >
      <button class="justify-self-center" @click="loadMore">
        {{ reachedEndOfResults ? "There are no more results." : "Load more" }}
      </button>
    </div>

    <div v-if="showMap" id="mapView">
      <Map
        v-if="showMap && eventResult && eventResult.queryEvent"
        :events="eventResult.queryEvent"
        :preview-is-open="eventPreviewIsOpen || multipleEventPreviewIsOpen"
        :color-locked="colorLocked"
        @highlightEvent="highlightEvent"
        @open-preview="openPreview"
        @lockColors="colorLocked = true"
        @setMarkerData="setMarkerData"
      />
      <div v-if="eventLoading">Loading...</div>
      <div
        class="overflow-y-scroll"
        style="position: fixed; right: 0; width: 34vw; "
      >
        <EventList
          class="overscroll-auto overflow-auto"
          key="highlightedEventId"
          v-if="showMap && eventResult && eventResult.queryEvent"
          :events="eventResult.queryEvent"
          :channel-id="channelId"
          :search-input="searchInput"
          :highlighted-event-location-id="highlightedEventLocationId"
          :highlighted-event-id="highlightedEventId"
          :selected-tags="selectedTags"
          :selected-channels="selectedChannels"
          :show-map="showMap"
          @filterByTag="filterByTag"
          @highlightEvent="highlightEvent"
          @open-preview="openPreview"
          @unhighlight="unhighlight"
        />
        <div class="grid justify-items-stretch">
          <button class="justify-self-center" @click="loadMore">
            {{
              reachedEndOfResults ? "There are no more results." : "Load more"
            }}
          </button>
        </div>
      </div>
    </div>

    <PreviewContainer
      :isOpen="eventPreviewIsOpen && !multipleEventPreviewIsOpen"
      :header="selectedEvent ? selectedEvent.title : 'Untitled'"
      :top-layer="true"
      @closePreview="closeEventPreview"
    >
      <EventPreview
        v-if="selectedEvent"
        :event="selectedEvent"
        @closePreview="closeEventPreview"
      />
    </PreviewContainer>

    <PreviewContainer
      :isOpen="multipleEventPreviewIsOpen"
      :header="'Events at this Location'"
      @closePreview="closeMultipleEventPreview"
    >
      <EventList
        v-if="selectedEvents"
        class="overscroll-auto overflow-auto"
        :events="selectedEvents"
        :channel-id="channelId"
        :highlighted-event-id="highlightedEventId"
        :show-map="showMap"
        @highlightEvent="highlightEvent"
        @open-preview="openPreview"
      />
      <div class="flex-shrink-0 px-4 py-4 flex justify-end">
        <CloseButton @click="closeMultipleEventPreview" />
      </div>
      <PreviewContainer
        :isOpen="multipleEventPreviewIsOpen && eventPreviewIsOpen"
        :header="selectedEvent ? selectedEvent.title : 'Untitled'"
        :top-layer="true"
        @closePreview="closeEventPreview"
      >
        <EventPreview
          v-if="selectedEvent"
          :event="selectedEvent"
          @closePreview="closeEventPreview"
        />
      </PreviewContainer>
    </PreviewContainer>
  </div>
</template>

<style>
.gray {
  color: gray;
}
</style>
