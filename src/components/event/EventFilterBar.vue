<script lang="ts">
import { defineComponent, computed, PropType } from "vue";
import LocationSearchBar from "@/components/forms/LocationSearchBar.vue";
import TagPicker from "@/components/forms/TagPicker.vue";
import FilterChip from "@/components/forms/FilterChip.vue";
import ChannelIcon from "../icons/ChannelIcon.vue";
import TagIcon from "../icons/TagIcon.vue";
import { getTagLabel, getChannelLabel } from "@/components/forms/utils";
import { chronologicalOrder, reverseChronologicalOrder } from "./filterStrings";
import { DateTime } from "luxon";
import ModalButton from "../ModalButton.vue";
import Tag from "../buttons/Tag.vue";
import { SearchEventValues } from "@/types/eventTypes";

const DateRangeTypes = {
  FUTURE: "FUTURE",
  PAST: "PAST",
  BETWEEN_TWO_DATES: "BETWEEN_TWO_DATES",
};
export default defineComponent({
  components: {
    ChannelIcon,
    FilterChip,
    LocationSearchBar,
    ModalButton,
    Tag,
    TagIcon,
    TagPicker,
  },
  props: {
    channelId: {
      type: String,
      default: "",
    },
    showMap: {
      type: Boolean,
      default: false,
    },
    filterValues: {
      type: Object as PropType<SearchEventValues>,
      required: true,
    },
  },

  setup(props) {
    const defaultFilterLabels = {
      channels: "Channels",
      tags: "Tags",
    };
    const channelLabel = computed(() => {
      return getChannelLabel(props.filterValues.selectedChannels);
    });

    const tagLabel = computed(() => {
      return getTagLabel(props.filterValues.selectedTags );
    });

    const now = DateTime.now();

    const getStartOfThisWeekend = () => {
      let startOfWeek = now.startOf("week");
      return startOfWeek.plus({ days: 5 });
    };

    const getStartOfNextWeek = () => {
      let startOfThisWeek = now.startOf("week");
      // If today is Sunday, look for events after
      // the following Sunday
      return startOfThisWeek.plus({ weeks: 1 });
    };

    const startOfThisWeekend = getStartOfThisWeekend();
    const startOfNextWeek = getStartOfNextWeek();
    const startOfThisMonth = now.startOf("month");

    const timeFilterShortcuts = [
      {
        label: "Today",
        beginningOfDateRangeISO: now.startOf("day").toISO(),
        endOfDateRangeISO: now.endOf("day").toISO(),
      },
      {
        label: "Tomorrow",
        beginningOfDateRangeISO: now.startOf("day").plus({ days: 1 }).toISO(),
        endOfDateRangeISO: now.endOf("day").plus({ days: 1 }).toISO(),
      },
      {
        label: "This weekend",
        beginningOfDateRangeISO: startOfThisWeekend.toISO(),
        endOfDateRangeISO: startOfThisWeekend.plus({ days: 2 }).toISO(),
      },
      {
        label: "Next week",
        beginningOfDateRangeISO: startOfNextWeek.toISO(),
        endOfDateRangeISO: startOfNextWeek.plus({ weeks: 1 }).toISO(),
      },
      {
        label: "Next weekend",
        beginningOfDateRangeISO: startOfNextWeek.plus({ days: 5 }).toISO(),
        endOfDateRangeISO: startOfNextWeek.plus({ weeks: 1 }).toISO(),
      },
      {
        label: "This month",
        beginningOfDateRangeISO: startOfThisMonth.toISO(),
        endOfDateRangeISO: startOfThisMonth.plus({ months: 1 }).toISO(),
      },
      {
        label: "Next month",
        beginningOfDateRangeISO: startOfThisMonth.plus({ months: 1 }).toISO(),
        endOfDateRangeISO: startOfThisMonth.plus({ months: 2 }).toISO(),
      },
      {
        label: "Past events",
        beginningOfDateRangeISO: now.minus({ years: 2 }).toISO(),
        endOfDateRangeISO: now.startOf("day").toISO(),
      },
    ];

    return {
      activeDateShortcut: "none",
      channelLabel,
      defaultFilterLabels,
      reverseChronologicalOrder,
      tagLabel,
      timeFilterShortcuts,
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
    handleTimeFilterShortcutClick(shortcut: any) {
      if (shortcut.label === this.activeDateShortcut) {
        this.activeDateShortcut = "none";
        this.$emit("handleTimeFilterShortcutClick", {
          beginningOfDateRangeISO: DateTime.now().startOf("day").toISO(),
          endOfDateRangeISO: DateTime.now().plus({ years: 2 }).toISO(),
        });
      } else {
        this.activeDateShortcut = shortcut.label;
        this.$emit("handleTimeFilterShortcutClick", {
          beginningOfDateRangeISO: shortcut.beginningOfDateRangeISO,
          endOfDateRangeISO: shortcut.endOfDateRangeISO,
        });
      }
    },
  },
});
</script>
<template>
  <div>
    <div class="items-center mt-2 space-x-2">
      Showing events within {{ filterValues.radius }}
      {{ filterValues.distanceUnit }} of
      <LocationSearchBar
        :search-placeholder="filterValues.referencePointAddress"
        :reference-point-address-name="filterValues.referencePointName"
        @updateLocationInput="$emit('updateLocationInput')"
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
            @setSelectedTags="$emit('setSelectedChannels', $event)"
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
            @setSelectedTags="$emit('setSelectedTags', $event)"
          />
        </template>
      </FilterChip>
      <Tag
        v-for="shortcut in timeFilterShortcuts"
        :key="shortcut.label"
        :tag="shortcut.label"
        :active="shortcut.label === activeDateShortcut"
        @click="handleTimeFilterShortcutClick(shortcut)"
      />
      More filters
      <ModalButton :show="false" :title="'title'">button</ModalButton>
    </div>
  </div>
</template>