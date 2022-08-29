<script lang="ts">
import { defineComponent, computed, ref, PropType } from "vue";
import LocationSearchBar from "@/components/forms/LocationSearchBar.vue";
import TagPicker from "@/components/forms/TagPicker.vue";
import FilterChip from "@/components/forms/FilterChip.vue";
import ChannelIcon from "../icons/ChannelIcon.vue";
import TagIcon from "../icons/TagIcon.vue";
import { getTagLabel, getChannelLabel } from "@/components/forms/utils";
import {
  hourRangesObject,
  weekdayObject,
} from "@/components/event/eventSearchOptions";
import {
  DistanceUnits,
  SearchEventValues,
  DateRangeTypes,
  LocationFilterTypes,
  SelectedWeeklyHourRanges,
} from "@/types/eventTypes";
import { chronologicalOrder, reverseChronologicalOrder } from "./filterStrings";
import { DateTime } from "luxon";
import ModalButton from "../ModalButton.vue";

export default defineComponent({
  components: {
    ChannelIcon,
    FilterChip,
    LocationSearchBar,
    ModalButton,
    TagIcon,
    TagPicker,
  },
  props: {
    channelId: {
      type: String,
      default: "",
    },
    formValues: {
      type: Object as PropType<SearchEventValues>,
      required: true,
    },
    showMap: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const now = DateTime.now();
    const nowISO = now.toISO();
    const futureEventsFilter = `{ startTime_GT: "${nowISO}" },`;
    const pastEventsFilter = `{ startTime_LT: "${nowISO}" },`;
    const startTimeFilter = ref(futureEventsFilter);
    const defaultStartDateObj = now.startOf("day");
    const defaultStartDateISO = defaultStartDateObj.toISO();
    const defaultEndDateRangeObj = defaultStartDateObj.plus({ days: 14 });
    const defaultEndDateRangeISO = defaultEndDateRangeObj.toISO();
    const showOnlyFreeEvents = ref(false);
    const searchInput = ref("");

    // values to take from params, fall back to default if not found

    // - show only free events
    // - text search
    // - location
    //   - radius
    //   - reference point latitude and longitude
    // - time
    //   - beginning of date range
    //   - end of date range
    //   - selectedWeeklyHourRanges

    const freeEventFilter = computed(() => {
      if (!showOnlyFreeEvents.value) {
        return "";
      }
      return `{ free: true },`;
    });

    const textFilter = computed(() => {
      if (searchInput.value) {
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

    const defaultSelectedHourRanges: SelectedWeeklyHourRanges = {};

    const getDefaultSelectedChannels = () => {
      if (props.channelId) {
        return [props.channelId];
      }
      return [];
    };

    const getDefaultFilterValues = () => {
      return {
        beginningOfDateRangeISO: defaultStartDateISO,
        endOfDateRangeISO: defaultEndDateRangeISO,
        resultsOrder: chronologicalOrder,
        radius: 5,
        distanceUnit: DistanceUnits.km,
        referencePoint: {
          // Default map center is Phoenix
          lat: 33.4484,
          lng: 112.074,
        },
        referencePointAddress: "",
        referencePointName: "",
        showCanceledEvents: false,
        selectedWeeklyHourRanges: defaultSelectedHourRanges,
        selectedTags: [],
        selectedChannels: getDefaultSelectedChannels(),
      };
    };

    const filterValues = ref(getDefaultFilterValues());

    const dateRangeFilter = computed(() => {
      return `
          {
            startTime_GT: "${filterValues.value.beginningOfDateRangeISO}"
          },
          {
            startTime_LT: "${filterValues.value.endOfDateRangeISO}"
          },`;
    });

    const locationFilter = computed(() => {
      switch (locationFilter.value) {
        case LocationFilterTypes.NONE:
          if (props.showMap) {
            return "{ location_NOT: null },";
          }
          return "";
        case LocationFilterTypes.ONLY_WITH_ADDRESS:
          // Filter by events that have a location
          // with coordinates
          return "{ location_NOT: null },";

        case LocationFilterTypes.ONLY_VIRTUAL:
          // Filter by events that have a virtual event URL
          if (props.showMap) {
            // If map view is shown, only include
            // events with both a physical location
            // and a virtual event url
            return `{ location_NOT: null },
            { virtualEventUrl_NOT: null },`;
          }
          return "{ virtualEventUrl_NOT: null },";

        case LocationFilterTypes.WITHIN_RADIUS:
          if (
            filterValues.value.radius &&
            filterValues.value.referencePoint &&
            filterValues.value.referencePointAddress
          ) {
            // Filter for events within a radius of a reference point
            return `{
              location_LTE: {
                point: {
                  latitude: ${filterValues.value.referencePoint.lat},
                  longitude: ${filterValues.value.referencePoint.lng},
                },
                distance: ${filterValues.value.radius * 1000}
              }
            },`;
          }
          return "";
        default:
          return "";
      }
    });

    const weeklyTimeRangeFilter = computed(() => {
      // The selected weekly time windows are in the
      // piece of state called selectedWeeklyHourRanges.
      // That data structure is an object where the keys
      // are weekdays and the values are objects where the
      // key is the time slot and the value is a boolean.

      // But to create a GraphQL query filter out of that,
      // this function flattens the structure.

      let flattened = "";
      for (let dayNumber in filterValues.value.selectedWeeklyHourRanges) {
        const selectedSlotsInDay =
          filterValues.value.selectedWeeklyHourRanges[dayNumber];

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
      if (filterValues.value.selectedTags.length > 0) {
        let matchTags = filterValues.value.selectedTags.reduce((prev, curr) => {
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
      if (filterValues.value.selectedChannels.length > 0) {
        let matchChannels = filterValues.value.selectedChannels.reduce(
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

    const eventFilterString = computed(() => {
      return `(
                options: {
                  sort: ${filterValues.value.resultsOrder}
                }
                where: {
                  AND: [
                    { canceled: ${filterValues.value.showCanceledEvents} },
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

    const defaultFilterLabels = {
      date: "Future Events",
      location: "Location",
      weeklyTimeSlot: "Weekday & Time",
      channels: "Channels",
      tags: "Tags",
    };
    const channelLabel = computed(() => {
      return getChannelLabel(filterValues.value.selectedChannels);
    });

    const tagLabel = computed(() => {
      return getTagLabel(filterValues.value.selectedTags);
    });

    const locationLabel = computed(() => {
      let distance = "";
      const {
        distanceUnit,
        radius,
        referencePoint,
        referencePointAddress,
        referencePointName,
      } = filterValues.value;

      switch (locationFilter.value) {
        case LocationFilterTypes.WITHIN_RADIUS:
          if (filterValues.value.distanceUnit === "km") {
            distance = radius.toString(2);
          } else if (distanceUnit === "mi") {
            distance = (filterValues.value.radius * 0.62137).toFixed(1);
          }
          if (referencePoint && referencePointAddress && referencePointName) {
            return `Within ${distance} ${filterValues.value.distanceUnit} of ${filterValues.value.referencePointName}`;
          } else if (filterValues.value.referencePointAddress) {
            return `Within ${distance} ${filterValues.value.distanceUnit} of ${filterValues.value.referencePointAddress}`;
          } else {
            return defaultFilterLabels.location;
          }
        case LocationFilterTypes.ONLY_WITH_ADDRESS:
          return "In-person only";
        case LocationFilterTypes.ONLY_VIRTUAL:
          return "Virtual only";
        default:
          return defaultFilterLabels.location;
      }
    });

    const getStartOfThisWeekend = () => {
      let startOfWeek = now.startOf("week");
      return startOfWeek.plus({ days: 5 })
    };

    const getStartOfNextWeek = () => {
      let startOfThisWeek = now.startOf("week");
      // If today is Sunday, look for events after
      // the following Sunday
      return startOfThisWeek.plus({ weeks: 1 })
    };

    const startOfThisWeekend = getStartOfThisWeekend();
    const startOfNextWeek = getStartOfNextWeek();
    const startOfThisMonth = now.startOf("month")

    const timeFilterShortcuts = [
      {
        label: "Today",
        beginningOfDateRangeISO: now.startOf("day").toISO(),
        endOfDateRangeISO: now.endOf("day").toISO(),
      },
      {
        label: "Tomorrow",
        beginningOfDateRangeISO: now.endOf("day").toISO(),
        endOfDateRangeISO: now.endOf("day").plus({ days: 1 }).toISO(),
      },
      {
        label: "This weekend",
        beginningOfDateRangeISO: startOfThisWeekend,
        endOfDateRangeISO: startOfThisWeekend.plus({ days: 2 }),
      },
      {
        label: "Next week",
        beginningOfDateRangeISO: startOfNextWeek,
        endOfDateRangeISO: startOfNextWeek.plus({ weeks: 1 }),
      },
      {
        label: "Next weekend",
        beginningOfDateRangeISO: startOfNextWeek.plus({ days: 5 }),
        endOfDateRangeISO: startOfNextWeek.plus({ weeks: 1 }),
      },
      {
        label: "This month",
        beginningOfDateRangeISO: startOfThisMonth,
        endOfDateRangeISO: startOfThisMonth.plus({ months: 1 }),
      },
      {
        label: "Next month",
        beginningOfDateRangeISO: startOfThisMonth.plus({ months: 1 }),
        endOfDateRangeISO: startOfThisMonth.plus({ months: 2 }),
      },
    ];

    return {
      channelLabel,
      defaultFilterLabels,
      eventFilterString,
      filterValues,
      locationLabel,
      locationFilter,
      reverseChronologicalOrder,
      pastEventsFilter,
      startTimeFilter,
      tagLabel,
      weeklyTimeRangeFilter,
    };
  },
  methods: {
    updateDateFilter(selectedDateRange: string, range: any) {
      this.dateRange = selectedDateRange;

      switch (selectedDateRange) {
        case DateRangeTypes.FUTURE:
          this.resultsOrder = this.chronologicalOrder;
          this.startTimeFilter = this.futureEventsFilter;
          this.$emit("updateFormValues", {
            resultsOrder: chronologicalOrder,
          });
          break;

        case DateRangeTypes.PAST:
          this.resultsOrder = this.reverseChronologicalOrder;
          this.startTimeFilter = this.pastEventsFilter;
          break;

        case DateRangeTypes.BETWEEN_TWO_DATES:
          this.resultsOrder = this.chronologicalOrder;
          this.startTimeFilter = this.betweenDateTimesFilter.value;
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
    updateLocationInput(placeData: any) {
      try {
        this.filterValues.referencePoint.lat =
          placeData.geometry.location.lat();
        this.filterValues.referencePoint.lng =
          placeData.geometry.location.lat();
        this.filterValues.referencePointAddress = placeData.formatted_address;
        this.filterValues.referencePointName = placeData.name;
      } catch (e: any) {
        throw new Error(e);
      }
    },
    updateRouterParams() {
      this.$emit("updateRouterParams", {
        path: "/events",
        query: {
          search: this.filterValues.searchInput,
          channel: this.filterValues.selectedChannels,
          tag: this.filterValues.selectedTags,
        },
      });
    },
    setSelectedChannels(e: any) {
      this.filterValues.selectedChannels = e;
    },
    setSelectedTags(e: any) {
      this.filterValues.selectedTags = e;
    },
  },
});
</script>
<template>
  <div>
    <div class="items-center mt-2 space-x-2">
      <LocationSearchBar
        :search-placeholder="'Location'"
        :reference-point-address-name="filterValues.referencePointName"
        @updateLocationInput="updateLocationInput"
      />
    </div>
    <div class="items-center mt-1 space-x-2">
      <FilterChip
        v-if="!channelId"
        :label="channelLabel"
        :highlighted="channelLabel !== defaultFilterLabels.channels"
      >
        <template v-slot:icon>
          <ChannelIcon class="-ml-0.5 w-4 h-4 mr-2" />
        </template>
        <template v-slot:content>
          <TagPicker
            :selected-tags="filterValues.selectedChannels"
            @setSelectedTags="setSelectedChannels"
          />
        </template>
      </FilterChip>
      <FilterChip
        :label="tagLabel"
        :highlighted="tagLabel !== defaultFilterLabels.tags"
      >
        <template v-slot:icon>
          <TagIcon class="-ml-0.5 w-4 h-4 mr-2" />
        </template>
        <template v-slot:content>
          <TagPicker
            :selected-tags="filterValues.selectedTags"
            @setSelectedTags="setSelectedTags"
          />
        </template>
      </FilterChip>
      More filters
      <ModalButton />
    </div>
  </div>
</template>