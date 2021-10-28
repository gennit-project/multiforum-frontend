<script lang="ts">
import { defineComponent, computed } from "vue";
import ActiveFilters from "@/components/forms/ActiveFilters.vue";
import ToggleMap from "../buttons/ToggleMap.vue";
import SortDropdown from "@/components/forms/SortDropdown.vue";
import EventList from "./EventList.vue";
import events from "../../testData/events";
import FilterModal from "@/components/forms/FilterModal.vue";
import ChannelPicker from "@/components/forms/ChannelPicker.vue";
import DatePicker from "@/components/forms/DatePicker.vue";
import OtherPicker from "@/components/forms/OtherPicker.vue";
import TagPicker from "@/components/forms/TagPicker.vue";
import LocationPicker from "@/components/forms/LocationPicker.vue";
import WeeklyTimePicker from "@/components/forms/WeeklyTimePicker.vue";

import { useRoute } from "vue-router";
import AddToFeed from "../buttons/AddToFeed.vue";
import Map from "./Map.vue";
import EventPreview from "./EventPreview.vue";
import { EventData } from "../../types/eventTypes";

export default defineComponent({
  setup() {
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId;
    });

    return {
      channelId,
      events,
    };
  },
  data() {
    return {
      showMap: false,
      previewIsOpen: false,
      selectedEvent: events[0],
      showModal: false,
      selectedFilterOptions: "",
      highlightedEventId: 0,
    };
  },
  components: {
    ActiveFilters,
    ToggleMap,
    SortDropdown,
    EventList,
    FilterModal,
    ChannelPicker,
    DatePicker,
    LocationPicker,
    WeeklyTimePicker,
    TagPicker,
    OtherPicker,
    EventPreview,
    AddToFeed,
    Map,
  },
  methods: {
    openModal(selectedFilterOptions: string) {
      this.showModal = true;
      this.selectedFilterOptions = selectedFilterOptions;
    },
    closeModal() {
      this.showModal = false;
      this.selectedFilterOptions = "";
    },
    closePreview() {
      this.previewIsOpen = false;
    },
    openPreview(data: EventData) {
      this.previewIsOpen = true;
      this.selectedEvent = data;
    },
    highlightEvent(eventId: number) {
      this.highlightedEventId = eventId
    }
  },
});

</script>
<template>
  <div class="bg-white">
    <ActiveFilters
      :search-placeholder="'Search by location'"
      :applicable-filters="['dateRange', 'location', 'weeklyTimes', 'channels', 'tags', 'other']"
      @openModal="openModal"
    />

    <div class="grid grid-cols-12 lg:space-x-4">
      <div class="col-span-12 lg:col-span-8">
        <div
          v-if="!showMap"
          class="relative h-full text-lg max-w-prose mx-auto"
        >
          <EventList 
            :events="events"
            :highlighted-event-id="highlightedEventId"
            @highlightEvent="highlightEvent"
            @open-preview="openPreview"
          />
        </div>
        <Map
          v-if="showMap"
          :events="events"
          :highlighted-event-id="highlightedEventId"
          @highlightEvent="highlightEvent"
          @open-preview="openPreview"
        />
      </div>
      <div class="col-span-12 lg:col-span-4 p-4">
        <SortDropdown />
        <ToggleMap
          :show-map="showMap"
          @showMap="showMap = true"
          @showList="showMap = false"
        />

        <AddToFeed v-if="channelId" />
        <EventList
          v-if="showMap"
          :events="events"
          :highlighted-event-id="highlightedEventId"
          @highlightEvent="highlightEvent"
          @open-preview="openPreview"
        />
      </div>
    </div>

    <div class="col-start-1 row-start-1 py-4"></div>

    <EventPreview
      :isOpen="previewIsOpen"
      :event="selectedEvent"
      @closePreview="closePreview"
    />
    <FilterModal :show="showModal" @closeModal="closeModal">
      <DatePicker v-if="selectedFilterOptions === 'datePicker'" />
      <LocationPicker v-if="selectedFilterOptions === 'typePicker'" />
      <ChannelPicker v-if="selectedFilterOptions === 'channelPicker'" />
      <TagPicker v-if="selectedFilterOptions === 'tagPicker'" />
      <OtherPicker v-if="selectedFilterOptions === 'otherPicker'" />
    </FilterModal>
    <FilterModal
      v-if="selectedFilterOptions === 'weeklyTimePicker'"
      :show="showModal"
      :is-large="true"
      @closeModal="closeModal"
    >
      <WeeklyTimePicker />
    </FilterModal>
  </div>
</template>