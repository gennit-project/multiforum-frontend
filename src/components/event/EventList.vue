<script lang="ts">
import { defineComponent, PropType } from "vue";
import EventListItem from "./EventListItem.vue";
import { EventData } from "../../types/eventTypes";

export default defineComponent({
  setup() {
  },
  props: {
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
        @openEventPreview="$emit('openPreview', event)"
      />
    </ul>
  </div>
</template>
