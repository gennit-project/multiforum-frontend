<script lang="ts">
import { defineComponent, computed } from "vue";
import ActiveFilters from "./ActiveFilters.vue";
import ToggleMap from "../buttons/ToggleMap.vue";
import SortDropdown from "./SortDropdown.vue";
import EventList from "./EventList.vue";
import events from "../../testData/events";
import Modal from "../Modal.vue";
import ChannelPicker from "./forms/ChannelPicker.vue";
import DatePicker from "./forms/DatePicker.vue";
import OtherPicker from "./forms/OtherPicker.vue";
import TagPicker from "./forms/TagPicker.vue";
import TypePicker from "./forms/TypePicker.vue";
import WeeklyTimePicker from "./forms/WeeklyTimePicker.vue";

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
    };
  },
  components: {
    ActiveFilters,
    ToggleMap,
    SortDropdown,
    EventList,
    Modal,
    ChannelPicker,
    DatePicker,
    TypePicker,
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
  },
});
</script>
<template>
  <div class="bg-white">
    <ActiveFilters @openModal="openModal" />

    <div class="grid grid-cols-12 lg:space-x-4">
      <div class="col-span-12 lg:col-span-8">
        <div
          v-if="!showMap"
          class="relative h-full text-lg max-w-prose mx-auto"
        >
          <EventList :events="events" @open-preview="openPreview" />
        </div>
        <Map v-if="showMap" :events="events" @open-preview="openPreview" />
      </div>
      <div class="col-span-12 lg:col-span-4">
            <ToggleMap
              :show-map="showMap"
              @showMap="showMap = true"
              @showList="showMap = false"
            />
            <SortDropdown/>
            <AddToFeed v-if="channelId" />
      </div>
    </div>

    <div class="col-start-1 row-start-1 py-4"></div>

    <EventPreview
      :isOpen="previewIsOpen"
      :event="selectedEvent"
      @closePreview="closePreview"
    />
    <Modal :show="showModal" @closeModal="closeModal">
      <DatePicker v-if="selectedFilterOptions === 'datePicker'" />
      <TypePicker v-if="selectedFilterOptions === 'typePicker'" />
      <WeeklyTimePicker v-if="selectedFilterOptions === 'weeklyTimePicker'" />
      <ChannelPicker v-if="selectedFilterOptions === 'channelPicker'" />
      <TagPicker v-if="selectedFilterOptions === 'tagPicker'" />
      <OtherPicker v-if="selectedFilterOptions === 'otherPicker'" />
    </Modal>
  </div>
</template>