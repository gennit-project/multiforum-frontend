<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import EventListItem from "./EventListItem.vue";
import { useRoute } from "vue-router";
import { EventData } from "../../types/eventTypes";

export default defineComponent({
  setup() {
    const route = useRoute();
    const channelId = computed(() => {
      return JSON.stringify(route.params.channelId) || "";
    });
    return {
      channelId,
    };
  },
  props: {
    highlightedEventId: {
      type: String,
      required: true
    },
    events: {
      type: Array as PropType<EventData[]>,
      default: () => { return []}
    },
    selectedTags: {
      type: Array as PropType<String[]>,
      default: () => { return []}
    },
    selectedChannels: {
      type: Array as PropType<String[]>,
      default: () => { return []}
    },
    showMap: {
      type: Boolean,
      default: false
    },
    searchInput: {
      type: String,
      default: ""
    }
  },
  components: {
    EventListItem
  },
  methods: {
    openPreview() {
      this.$emit('openPreview');
    },
    filterByTag(tag: string) {
      this.$emit("filterByTag", tag);
    },
  }
});
</script>

<template>
  <div class="bg-white shadow sm:rounded-md">
    <ul role="list" class="divide-y divide-gray-200">
      <EventListItem 
        v-for="event in events"
        :key="event.id"
        :event="event"
        :selected-tags="selectedTags"
        :selected-channels="selectedChannels"
        :search-input="searchInput"
        :current-channel-id="channelId"
        :class="[highlightedEventId === event.id && showMap ? 'bg-gray-100' : '']"
        @mouseover="
          () => {
            $emit('highlightEvent', event.id);
          }
        "
        @mouseleave="
          () => {
            $emit('highlightEvent', '')
          }
        "
        @openEventPreview="$emit('openPreview', event)"
        @filterByTag="filterByTag"
      />
    </ul>
  </div>
</template>
