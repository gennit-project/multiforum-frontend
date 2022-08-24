<script lang="ts">
import { defineComponent, computed, ref } from "vue";

import { gql } from "@apollo/client/core";
import { useQuery } from "@vue/apollo-composable";
import { GET_CHANNEL_NAMES } from "@/graphQLData/channel/queries";
import { GET_TAGS } from "@/graphQLData/tag/queries";

import AddToFeed from "../buttons/AddToFeed.vue";
import DatePicker from "@/components/forms/DatePicker.vue";
import EventList from "./EventList.vue";
import EventPreview from "./EventPreview.vue";
import LocationIcon from "../icons/LocationIcon.vue";
import LocationSearchBar from "@/components/forms/LocationSearchBar.vue";
import LocationPicker from "@/components/forms/LocationPicker.vue";
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
import CreateButton from "@/components/buttons/CreateButton.vue";

import {
  defaultSelectedWeekdays,
  defaultSelectedHourRanges,
  defaultSelectedWeeklyHourRanges,
  hourRangesObject,
  locationFilterOptions,
  weekdayObject,
  distanceOptions,
  distanceUnitOptions,
  weekdayMap,
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

import { DateTime } from "luxon";


interface Ref<T> {
  value: T;
}

export default defineComponent({
  name: "SearchEvents",
  components: {
    AddToFeed,
    CalendarIcon,
    ChannelIcon,
    CloseButton,
    CreateButton,
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
  setup() {
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId;
    });

    const selectedTags: Ref<Array<string>> = ref([]);

    const getDefaultSelectedChannels = () => {
      if (channelId.value) {
        return [channelId.value];
      }
      return [];
    };

    const selectedChannels: any = ref(getDefaultSelectedChannels());
    const searchInput: Ref<string> = ref("");

    // Variables for the order of the results
    const chronologicalOrder = `[{ startTime: ASC }]`;
    const reverseChronologicalOrder = `[{ startTime: DESC }]`;

    const now = DateTime.now();
    const nowISO = now.toISO();
    const defaultStartDateObj = now.startOf("day");
    const defaultStartDateISO = defaultStartDateObj.toISO();
    const defaultEndDateRangeObj = defaultStartDateObj.plus({ days: 14 });
    const defaultEndDateRangeISO = defaultEndDateRangeObj.toISO();

    const dateRange = ref(dateRangeTypes.FUTURE);

    const futureEventsFilter = `{ startTime_GT: "${nowISO}" },`;
    const pastEventsFilter = `{ startTime_LT: "${nowISO}" },`;

    const startTimeFilter = ref(futureEventsFilter);
    const resultsOrder = ref(chronologicalOrder);
    const beginningOfDateRange = ref(defaultStartDateISO);
    const endOfDateRange = ref(defaultEndDateRangeISO);
    const betweenDateTimesFilter = computed(() => {
      return `
          {
            startTime_GT: "${beginningOfDateRange.value}"
          },
          {
            startTime_LT: "${endOfDateRange.value}"
          },`;
    });

    const defaultReferencePoint: ReferencePoint = {
      lat: 33.4255,
      lng: -111.94,
    };
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
      return `{ free: true },`;
    });

    let textFilter = computed(() => {
      if (!searchInput.value) {
        return "";
      }

      // Match a case-insensitive regex for the search term
      return `,
      { 
        OR: [
			    {
		        title_MATCHES: "(?i).*${searchInput.value}.*"
			    },{
			    	description_MATCHES: "(?i).*${searchInput.value}.*"
			    }
		    ]
      },
      `;
    });

    let selectedLocationFilter = ref(locationFilterOptions[0].value);

    let showMap = ref(false);

    let locationFilter = computed(() => {
      switch (selectedLocationFilter.value) {
        case locationFilterTypes.NONE:
          if (showMap.value) {
            return "{ location_NOT: null },";
          }
          return "";
        case locationFilterTypes.ONLY_WITH_ADDRESS:
          // Filter by events that have a location
          // with coordinates
          return "{ location_NOT: null },";

        case locationFilterTypes.ONLY_VIRTUAL:
          // Filter by events that have a virtual event URL
          if (showMap.value) {
            // If map view is shown, only include
            // events with both a physical location
            // and a virtual event url
            return `{ location_NOT: null },
            { virtualEventUrl_NOT: null },`;
          }
          return "{ virtualEventUrl_NOT: null },";

        case locationFilterTypes.WITHIN_RADIUS:
          if (
            radius.value &&
            referencePoint.value &&
            referencePointAddress.value
          ) {
            // Filter for events within a radius of a reference point
            return `{
              location_LTE: {
                point: {
                  latitude: ${referencePoint.value.lat},
                  longitude: ${referencePoint.value.lng},
                },
                distance: ${radius.value * 1000}
              }
            },`;
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
      // this function flattens the structure.

      let flattened = "";
      for (let dayNumber in selectedWeeklyHourRanges.value) {
        const selectedSlotsInDay = selectedWeeklyHourRanges.value[dayNumber];

        for (let timeSlot in selectedSlotsInDay) {
          const slotIsSelected = selectedSlotsInDay[timeSlot];

          if (slotIsSelected) {
            flattened = flattened.concat(`
              {
                AND: [
                  {
                    startTimeHourOfDay_LTE: ${hourRangesObject[timeSlot].max}
                  },
                  {
                    startTimeHourOfDay_GTE: ${hourRangesObject[timeSlot].min}
                  },
                  {
                    startTimeDayOfWeek: "${weekdayObject[dayNumber]}"
                  }
                ]
              },
            `);
          }
        }
      }

      if (flattened === "") {
        return "";
      }
      let timeSlotFilter = `{
          OR: [
            ${flattened}
          ]
        },`;
      return timeSlotFilter;
    });

    let tagFilter = computed(() => {
      if (selectedTags.value.length > 0) {
        let matchTags = selectedTags.value.reduce((prev, curr) => {
          return prev + `{ text_MATCHES: "(?i)${curr}" },`;
        }, "");
        return `{
          TagsConnection: {
            node: {
              OR: [${matchTags}]
            }
          }
        }`;
      }
      return "";
    });

    let channelFilter = computed(() => {
      if (selectedChannels.value.length > 0) {
        let matchChannels = selectedChannels.value.reduce(
          (prev: string, curr: string) => {
            return prev + `{ uniqueName_MATCHES: "(?i)${curr}" },`;
          },
          ""
        );
        return `{
          ChannelsConnection: {
            node: {
              OR: [${matchChannels}]
            }
          }
        }`;
      }
      return "";
    });

    let eventFilterString = computed(() => {
      return `(
                options: {
                  sort: ${resultsOrder.value}
                }
                where: {
                  AND: [
                    {
											ChannelsAggregate: {
												count_GT: 0
											}
										},
                    ${startTimeFilter.value}
                    ${freeEventFilter.value}
                    ${textFilter.value}
                    ${weeklyTimeRangeFilter.value}
                    ${locationFilter.value}
                    ${channelFilter.value}
                    ${tagFilter.value}
                  ]
                }
              ) `;
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
      searchInput.value = input; // remove - should watch params instead
      updateRouterQueryParams();
    };
    const setSelectedTags = (tag: Array<string>) => {
      selectedTags.value = tag;
      updateRouterQueryParams();
    };
    const setSelectedChannels = (channel: Array<string>) => {
      selectedChannels.value = channel;
      updateRouterQueryParams();
    };

    let eventQueryString = computed(() => {
      let str = `
        query {
          events ${eventFilterString.value}{
            id
            Channels {
              uniqueName
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
            Tags {
              text
            }
            CommentSections {
              id
              CommentsAggregate {
                count
              }
              OriginalPost {
                __typename
                ... on Discussion {
                  id
                  title
                }
                ... on Event {
                  id
                  title
                }
              }
              Channel {
                uniqueName
              }
            }
          }
        }`;
      return str;
    });

    // Turn the query string into an actual GraphQL
    // query. Any GraphQL syntax errors will be thrown here.
    let eventQuery = computed(() => {
      try {
        return gql`
          ${eventQueryString.value}
        `;
      } catch (err) {
        throw new Error(`Invalid query string: ${eventQueryString.value}`);
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
          offset: eventResult.value.events.length,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (fetchMoreResult.events.length === 0) {
            reachedEndOfResults.value = true;
            return prev;
          }
          return {
            ...prev,
            events: [...prev.events, ...fetchMoreResult.events],
          };
        },
      });
    };

    const { result: tagResult } = useQuery(GET_TAGS);
    const { result: channelResult } = useQuery(GET_CHANNEL_NAMES);

    const tagOptionLabels = computed(() => {
      if (tagResult.value) {
        return tagResult.value.tags.map((tag: TagData) => tag.text);
      }
      return []
    })

    const channelOptionLabels = computed(() => {
      if (channelResult.value) {
        return channelResult.value.channels.map((channel: ChannelData) => channel.uniqueName);
      }
      return []
    })

    const defaultFilterLabels = {
      date: "Future Events",
      location: "Location",
      weeklyTimeSlot: "Weekday & Time",
      channels: "Channels",
      tags: "Tags",
      other: "Other Filters",
    };

    const channelLabel = computed(() => {
      return getChannelLabel(selectedChannels.value);
    });

    const tagLabel = computed(() => {
      return getTagLabel(selectedTags.value);
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
            return defaultFilterLabels.location;
          }
        case locationFilterTypes.ONLY_WITH_ADDRESS:
          return "In-person only";
        case locationFilterTypes.ONLY_VIRTUAL:
          return "Virtual only";
        default:
          return defaultFilterLabels.location;
      }
    });

    const dateLabel = computed(() => {
      // eslint-disable-next-line
      const startDateObject = DateTime.fromISO(beginningOfDateRange.value);
      // eslint-disable-next-line
      const endDateObject = DateTime.fromISO(endOfDateRange.value);
      const formattedStartDate = startDateObject.toLocaleString(
        DateTime.DATE_MED
      );
      const formattedEndDate = endDateObject.toLocaleString(DateTime.DATE_MED);

      switch (dateRange.value) {
        case dateRangeTypes.FUTURE:
          return defaultFilterLabels.date;

        case dateRangeTypes.PAST:
          return `Past Events`;

        case dateRangeTypes.BETWEEN_TWO_DATES:
          return `From ${formattedStartDate} to ${formattedEndDate}`;

        default:
          return "";
      }
    });

    const weeklyTimeLabel = computed(() => {
      let weekdayLabels = [];
      let selectedHourRangeLabels = [];
      let selectedWeeklyHourRangeLabels = [];

      // Populate weekday labels, ex. Saturdays and Sundays
      for (let weekdayNumber in selectedWeekdays.value) {
        if (selectedWeekdays.value[weekdayNumber] === true) {
          const weekdayName = weekdayMap[weekdayNumber];
          const weekdayLabel = `${weekdayName}s`;
          weekdayLabels.push(weekdayLabel);
        }
      }

      // Populate hour range labels, ex. 4-6pm, 2-4pm
      for (let hourRange in selectedHourRanges.value) {
        if (selectedHourRanges.value[hourRange] === true) {
          const hourRangeLabel = `Any day at ${hourRange}`;
          selectedHourRangeLabels.push(hourRangeLabel);
        }
      }

      // Populate weekly time slot labels, ex. Saturdays from 12-2pm
      for (let weekdayNumber in selectedWeeklyHourRanges.value) {
        const hourRangesForWeekday =
          selectedWeeklyHourRanges.value[weekdayNumber];

        for (let hourRange in hourRangesForWeekday) {
          // Don't add "Wednesdays from 2-4pm" if "Wednesdays" is already added
          // or if "2-4pm" is already added
          if (
            hourRangesForWeekday[hourRange] === true &&
            selectedWeekdays.value[weekdayNumber] === false &&
            selectedHourRanges.value[hourRange] === false
          ) {
            const timeSlotLabel = `${weekdayMap[weekdayNumber]}s from ${hourRange}`;
            selectedWeeklyHourRangeLabels.push(timeSlotLabel);
          }
        }
      }
      const allLabels = [
        ...weekdayLabels,
        ...selectedHourRangeLabels,
        ...selectedWeeklyHourRangeLabels,
      ];

      if (allLabels.length === 0) {
        return defaultFilterLabels.weeklyTimeSlot;
      }
      return allLabels.join(", ");
    });

    const otherFiltersLabel = computed(() => {
      if (!searchInput.value && !showOnlyFreeEvents.value) {
        return defaultFilterLabels.other;
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

    const createEventPath = channelId.value ? `/channels/c/${channelId.value}/events/create` : '/events/create'

    return {
      channelId,
      beginningOfDateRange,
      betweenDateTimesFilter,
      channelLabel,
      channelOptionLabels,
      chronologicalOrder,
      createEventPath,
      dateLabel,
      dateRange,
      defaultEndDateRangeISO,
      defaultFilterLabels,
      defaultSelectedHourRanges,
      defaultStartDateISO,
      distanceUnit,
      endOfDateRange,
      eventLoading,
      eventQuery,
      eventQueryString,
      eventResult,
      eventFilterString,
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
      showMap,
      searchInput,
      selectedHourRanges,
      selectedWeekdays,
      selectedWeeklyHourRanges,
      setSearchInput,
      setSelectedChannels,
      setSelectedTags,
      selectedChannels,
      selectedLocationFilter,
      selectedTags,
      startTimeFilter,
      tagLabel,
      tagOptionLabels,
      weeklyTimeLabel,
      weeklyTimeRangeFilter,
    };
  },
  data() {
    return {
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
          const eventTitle =
            this.markerMap[eventLocationId].events[this.highlightedEventId]
              .title;
          const eventLocation =
            this.markerMap[eventLocationId].events[this.highlightedEventId]
              .locationName;

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
        const eventsAtClickedLocation =
          this.markerMap[this.highlightedEventLocationId].numberOfEvents;

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
      this.setSelectedTags([tag]);
    },
    setMarkerData(data: any) {
      this.markerMap = data.markerMap;
      this.map = data.map;
    },
    setShowMap() {
      this.showMap = true;
      const path = this.channelId
        ? `/channels/c/${this.channelId}/events`
        : "events";
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
      const path = this.channelId
        ? `/channels/${this.channelId}/events`
        : "events";
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

      switch (selectedDateRange) {
        case dateRangeTypes.FUTURE:
          this.resultsOrder = this.chronologicalOrder;
          this.startTimeFilter = this.futureEventsFilter;
          break;

        case dateRangeTypes.PAST:
          this.resultsOrder = this.reverseChronologicalOrder;
          this.startTimeFilter = this.pastEventsFilter;
          break;

        case dateRangeTypes.BETWEEN_TWO_DATES:
          this.resultsOrder = this.chronologicalOrder;
          this.startTimeFilter = this.betweenDateTimesFilter;
          if (range) {
            const start = new Date(range.start).toISOString();
            this.beginningOfDateRange = start;

            const end = new Date(range.end).toISOString();
            this.endOfDateRange = end;
          }
          break;
        default:
          break;
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
  <div class="container">
    <div class="items-center mt-2 space-x-2">
      <LocationSearchBar
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
      <CreateButton :to="createEventPath" :label="'Create Event'"/>
    </div>
    <div class="items-center mt-1 space-x-2">
      <FilterChip
        :label="dateLabel"
        :highlighted="dateLabel !== defaultFilterLabels.date"
      >
        <template v-slot:icon>
          <CalendarIcon class="-ml-0.5 w-4 h-4 mr-2"/>
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

      <FilterChip
        :label="locationLabel"
        :highlighted="locationLabel !== defaultFilterLabels.location"
      >
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

      <FilterChip
        :label="weeklyTimeLabel"
        :highlighted="weeklyTimeLabel !== defaultFilterLabels.weeklyTimeSlot"
      >
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

      <FilterChip
        v-if="!channelId"
        :label="channelLabel"
        :highlighted="channelLabel !== defaultFilterLabels.channels"
      >
        <template v-slot:icon>
          <ChannelIcon class="-ml-0.5 w-4 h-4 mr-2"/>
        </template>
        <template v-slot:content>
          <TagPicker
            :tag-options="channelOptionLabels"
            :selected-tags="selectedChannels"
            @setSelectedTags="setSelectedChannels"
          />
        </template>
      </FilterChip>

      <FilterChip
        :label="tagLabel"
        :highlighted="tagLabel !== defaultFilterLabels.tags"
      >
        <template v-slot:icon>
          <TagIcon class="-ml-0.5 w-4 h-4 mr-2"/>
        </template>
        <template v-slot:content>
          <TagPicker
            :tag-options="tagOptionLabels"
            :selected-tags="selectedTags"
            @setSelectedTags="setSelectedTags"
          />
        </template>
      </FilterChip>

      <FilterChip
        :label="otherFiltersLabel"
        :highlighted="otherFiltersLabel !== defaultFilterLabels.other"
      >
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
              :search-placeholder="'Search'"
              @updateSearchInput="updateSearchResult"
            />

            <div class="relative flex items-start mt-4">
              <div class="flex items-center h-5">
                <input
                  class="
                    focus:ring-blue-500
                    h-4
                    w-4
                    text-blue-600
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
      v-if="!showMap && eventResult && eventResult.events"
      :class="[!channelId ? '' : '']"
      class="relative text-lg"
      :events="eventResult.events"
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
      v-if="!showMap && eventResult && eventResult.events"
      class="grid justify-items-stretch"
    >
      <button class="justify-self-center" @click="loadMore">
        {{ reachedEndOfResults ? "There are no more results." : "Load more" }}
      </button>
    </div>

    <div v-if="eventLoading">Loading...</div>
    <div
      v-else-if="showMap && eventResult && eventResult.events"
      id="mapView"
      class="overflow-y-scroll"
    >
      <div style="position: fixed; width: 66vw; height: calc(100vh - 130px)">
        <Map
          :events="eventResult.events"
          :preview-is-open="eventPreviewIsOpen || multipleEventPreviewIsOpen"
          :color-locked="colorLocked"
          @highlightEvent="highlightEvent"
          @open-preview="openPreview"
          @lockColors="colorLocked = true"
          @setMarkerData="setMarkerData"
        />
      </div>
      <div style="position: fixed; right: 0; width: 34vw">
        <EventList
          class="overscroll-auto overflow-auto"
          key="highlightedEventId"
          :events="eventResult.events"
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
