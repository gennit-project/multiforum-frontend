<script lang="ts">
import { defineComponent } from "vue";
import EventListItem from "./EventListItem.vue";
import EventPreview from "./EventPreview.vue";
import { EventData } from "../../types/eventTypes";

const events = [
  {
    id: 1,
    title: "Back End Developer",
    type: "Full-time",
    location: "Remote",
    description: "Engineering",
    date: "2020-01-07",
    dateFull: "January 7, 2020",
    channelId: "Development"
  },
  {
    id: 2,
    title: "Front End Developer",
    type: "Full-time",
    location: "Remote",
    description: "Engineering",
    date: "2020-01-07",
    dateFull: "January 7, 2020",
    channelId: "Development"
  },
  {
    id: 3,
    title: "User Interface Designer",
    type: "Full-time",
    location: "Remote",
    description: "Design",
    date: "2020-01-14",
    dateFull: "January 14, 2020",
    channelId: "Development"
  },
];

export default defineComponent({
  setup() {
    return {
      events,
      selectedEvent: events[0]
    };
  },
  data() {
    return {
      previewIsOpen: false
    }
  },
  components: {
    EventListItem,
    EventPreview
  },
  methods: {
    openPreview(data: EventData) {
      this.previewIsOpen = true
      this.selectedEvent = data
    },
    closePreview() {
      this.previewIsOpen = false
    }
  }
});
</script>

<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-md">
    <ul role="list" class="divide-y divide-gray-200">
      <EventListItem 
        v-for="event in events"
        :key="event.id"
        :event="event"
        @openEventPreview="openPreview"
      />
      <EventPreview
        :isOpen="previewIsOpen"
        :event="selectedEvent"
        @closePreview="closePreview"
      />
    </ul>
  </div>
</template>
