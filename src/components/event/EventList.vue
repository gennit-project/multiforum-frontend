<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import EventListItem from "./EventListItem.vue";
import { useRoute, useRouter } from "vue-router";
import { EventData } from "@/types/eventTypes";

export default defineComponent({
  setup() {
    const route = useRoute();
    const router = useRouter();
    const channelId = computed(() => {
      return route.params.channelId || "";
    });
    return {
      channelId,
      router,
    };
  },
  props: {
    highlightedEventLocationId: {
      type: String,
      default: "",
    },
    highlightedEventId: {
      type: String,
      default: "",
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
    filterByTag(tag: string) {
      this.$emit("filterByTag", tag);
    },
    getEventLocationId(event: EventData) {
      if (event.location) {
        return (
          (event.location.latitude.toString() || "") +
          (event.location?.longitude.toString() || "")
        );
      }
      return "no_location";
    },
    handleClickEventListItem(event: EventData) {
      if (this.showMap) {
        this.$emit("openPreview", event.id);
      } else {

        if (this.channelId) {
          return this.router.push({
            name: "EventDetail",
            params: {
              eventId: event.id,
              channelId: this.channelId,
            },
          });
        }
        return this.router.push({
          name: "EventDetail",
          params: {
            eventId: event.id,
            channelId: event.Channels[0].uniqueName
          }
        })
      }
    },
  },
});
</script>

<template>
  <div :class="['bg-white', 'sm:rounded-md']">
    <p v-if="events.length === 0 && !showMap">Could not find any events.</p>
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
          event.id === highlightedEventId ||
          (!highlightedEventId &&
            highlightedEventLocationId === getEventLocationId(event))
            ? 'bg-gray-100'
            : '',
        ]"
        @mouseover="
          () => {
            if (showMap) {
              $emit(
                'highlightEvent',
                getEventLocationId(event),
                event.id,
                event
              );
            }
          }
        "
        @mouseleave="
          () => {
            if (showMap) {
              $emit('unhighlight');
            }
          }
        "
        @clickedEventListItem="handleClickEventListItem(event)"
        @filterByTag="filterByTag"
      />
    </ul>
  </div>
</template>