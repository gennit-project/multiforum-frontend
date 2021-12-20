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
    highlightedEventLocationId: {
      type: String,
      required: true,
    },
    events: {
      type: Array as PropType<EventData[]>,
      default: () => {
        return [];
      },
    },
    selectedTags: {
      type: Array as PropType<String[]>,
      default: () => {
        return [];
      },
    },
    selectedChannels: {
      type: Array as PropType<String[]>,
      default: () => {
        return [];
      },
    },
    showMap: {
      type: Boolean,
      default: false,
    },
    searchInput: {
      type: String,
      default: "",
    },
  },
  components: {
    EventListItem,
  },
  methods: {
    openPreview(event: EventData) {
      this.$emit("highlightEvent", this.getEventLocationId(event), event.id, event.title);
      this.$emit("openPreview", event);
      this.$emit("lockColors");
    },
    filterByTag(tag: string) {
      this.$emit("filterByTag", tag);
    },
    getEventLocationId(event: EventData) {
      return (event.location?.latitude.toString() || '') + (event.location?.longitude.toString() || '')
    }
  }
});
</script>

<template>
  <div :class="['bg-white', 'shadow', 'sm:rounded-md', showMap ? 'constrain-height' : '']">
    <ul role="list" class="divide-y divide-gray-200">
      <EventListItem
        :ref="`#${event.id}`"
        v-for="event in events"
        :key="event.id"
        :event="event"
        :selected-tags="selectedTags"
        :selected-channels="selectedChannels"
        :search-input="searchInput"
        :current-channel-id="channelId"
        :class="[
          highlightedEventLocationId === getEventLocationId(event) && showMap ? 'bg-gray-100' : ''
        ]"
        @mouseover="
          () => {
            $emit('highlightEvent', getEventLocationId(event), event.id, event.title);
          }
        "
        @mouseleave="
          () => {
            $emit('unhighlight');
          }
        "
        @openEventPreview="openPreview"
        @filterByTag="filterByTag"
      />
    </ul>
  </div>
</template>

<style>
.constrain-height {
height: calc(100vh - 150px)
}
</style>
