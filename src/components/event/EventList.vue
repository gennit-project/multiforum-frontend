<script lang="ts">
import { defineComponent, PropType } from "vue";
import EventListItem from "./EventListItem.vue";
import { EventData } from "../../types/eventTypes";

export default defineComponent({
  setup() {
  },
  props: {
    highlightedEventId: {
      type: Number,
      required: true
    },
    events: {
      type: Array as PropType<EventData[]>
    }
  },
  components: {
    EventListItem
  },
  methods: {
    openPreview() {
      this.$emit('openPreview');
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
        :class="[highlightedEventId === event.id ? 'bg-gray-100' : '']"
        @mouseover="
          () => {
            $emit('highlightEvent', event.id);
          }
        "
        @mouseleave="
          () => {
            $emit('highlightEvent', 0)
          }
        "
        @openEventPreview="$emit('openPreview', event)"
      />
    </ul>
  </div>
</template>
