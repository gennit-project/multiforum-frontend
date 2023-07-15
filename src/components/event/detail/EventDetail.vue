<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import Tag from "@/components/tag/Tag.vue";
import { useQuery } from "@vue/apollo-composable";
import { useRoute } from "vue-router";
import { ChannelData } from "@/types/channelTypes";
import { GET_EVENT } from "@/graphQLData/event/queries";
import { EventData } from "@/types/eventTypes";
import { relativeTime } from "../../../dateTimeUtils";
import { DateTime } from "luxon";
import ErrorBanner from "../../generic/ErrorBanner.vue";
import "md-editor-v3/lib/style.css";
import LeftArrowIcon from "../../icons/LeftArrowIcon.vue";
import EventFooter from "./EventFooter.vue";
import { MdEditor } from "md-editor-v3";
import { useDisplay } from "vuetify";
import EventHeader from "./EventHeader.vue";

export default defineComponent({
  props: {
    compactMode: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    ErrorBanner,
    EventFooter,
    EventHeader,
    LeftArrowIcon,
    MdEditor,
    Tag,
  },
  setup() {
    const route = useRoute();
    const showFullDescription = ref(route.name === "EventDetail");

    const eventId = computed(() => {
      return route.params.eventId;
    });
    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    const {
      result: eventResult,
      error: eventError,
      loading: eventLoading,
    } = useQuery(GET_EVENT, { id: eventId });

    const eventData = computed(() => {
      if (
        !eventResult.value ||
        !eventResult.value.events ||
        !eventResult.value.events[0]
      ) {
        return null;
      }
      return eventResult.value.events[0];
    });

    const truncatedDescription = computed(() => {
      if (!eventData.value || !eventData.value.description) {
        return "";
      }

      const words = eventData.value.description.split(" ");
      return words.length > 50
        ? words.slice(0, 50).join(" ") + "..."
        : eventData.value.description;
    });

    const toggleDescription = () => {
      showFullDescription.value = !showFullDescription.value;
    };

    const channelsExceptCurrent = computed(() => {
      if (!eventResult.value || !eventResult.value.events[0]) {
        return [];
      }
      const event: EventData = eventResult.value.events[0];
      const channels = event.Channels;
      const channelsExceptCurrent = channels.filter((channel: ChannelData) => {
        return channel.uniqueName !== channelId.value;
      });
      return channelsExceptCurrent;
    });

    // Each event can have multiple comment sections
    // because there's a different comment section for each
    // channel that the event is in.
    // The idea is to show the comments that correspond
    // to the channel in the current URL.
    let commentSectionId: string = "";

    if (typeof eventId.value === "string") {
      commentSectionId = eventId.value + channelId.value;
    } else {
      throw new Error("Event ID is not a string.");
    }

    const eventIsInThePast = computed(() => {
      if (!eventData.value) {
        return false;
      }
      return (
        DateTime.fromISO(eventData.value.startTime) <
        DateTime.fromISO(new Date().toISOString())
      );
    });

    const locationText = computed(() => {
      if (!eventData.value || !eventData.value.address) {
        return "";
      }
      if (eventData.value.locationName) {
        return `${eventData.value.locationName}, ${eventData.value.address}`;
      }
      return eventData.value.address;
    });

    const { mdAndUp } = useDisplay();

    const visibleDescription = computed(() => {
      if (showFullDescription.value) {
        return eventData.value?.description;
      }
      return truncatedDescription.value;
    });
    return {
      eventData,
      eventResult,
      eventError,
      eventIsInThePast,
      eventLoading,
      eventId,
      channelId,
      channelsExceptCurrent,
      commentSectionId,
      locationText,
      mdAndUp,
      relativeTime,
      route,
      showFullDescription,
      truncatedDescription,
      toggleDescription,
      visibleDescription,
    };
  },
  methods: {
    openLink() {
      window.open(this.eventData.virtualEventUrl, "_blank");
    },
  },
});
</script>

<template>
  <div
    class="height-constrained-more px-4 pb-36 pt-4 lg:w-full space-y-2 flex justify-center"
  >
    <div
      :class="
        route.name === 'EventDetail' && mdAndUp ? 'large-width' : 'w-full'
      "
      class="space-y-2"
    >
      <router-link
        v-if="route.name === 'EventDetail'"
        :to="`/channels/c/${channelId}/events/search`"
        class="text-xs text-gray-500 mb-4"
      >
        <LeftArrowIcon class="h-4 w-4 mr-1 pb-1 inline-flex" />
        <span class="underline">{{ `Event list in c/${channelId}` }}</span>
      </router-link>
      <p class="px-4 lg:px-10" v-if="eventLoading">Loading...</p>
      <ErrorBanner
        class="px-4 lg:px-10"
        v-else-if="eventError"
        :text="eventError.message"
      />

      <div v-else-if="!eventData">
        <p>Could not find the event.</p>
      </div>

      <div
        v-else-if="eventResult && eventResult.events && eventData"
        class="dark:bg-dark-700 pt-4 max-w-2xl mx-auto"
      >
        <ErrorBanner
          class="mt-2 mb-2"
          v-if="eventIsInThePast"
          :text="'This event is in the past.'"
        />
        <ErrorBanner
          data-testid="canceled-event-banner"
          class="mt-2 mb-2"
          v-if="eventData.canceled"
          :text="'This event is canceled.'"
        />
        <EventHeader :event-data="eventData" />
        <div class="mt-4">
          <md-editor
            v-if="eventData.description"
            class="max-w-2xl small-text"
            v-model="visibleDescription"
            previewTheme="github"
            language="en-US"
            :noMermaid="true"
            preview-only
          />
          <button
            v-if="
              eventData?.description &&
              eventData.description.split(' ').length > 50
            "
            @click="toggleDescription"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
          >
            {{ showFullDescription ? "Show less" : "Show more" }}
          </button>
        </div>
        <div class="mx-4 my-2">
          <Tag
            class="mt-2"
            v-for="tag in eventData.Tags"
            :tag="tag.text"
            :key="tag.text"
            :eventId="eventId"
          />
          <div
            v-if="channelId && channelsExceptCurrent.length > 0"
            class="mt-2"
          >
            Crossposted To Channels
          </div>

          <router-link
            v-for="channel in channelsExceptCurrent"
            :key="channel.uniqueName"
            :to="`/channels/c/${channel.uniqueName}/events/e/${eventId}`"
          >
            <Tag class="mt-2" :tag="channel.uniqueName" :channel-mode="true" />
          </router-link>
        </div>
        <EventFooter
          :event-data="eventData"
          :channels-except-current="channelsExceptCurrent"
        />
      </div>
    </div>
  </div>
</template>
<style lang="scss">
/* Apply the user's preferred color scheme by default */
@media (prefers-color-scheme: dark) {
  #texteditor-textarea {
    @apply bg-dark text-dark;
  }
}

@media (prefers-color-scheme: light) {
  #texteditor-textarea {
    @apply bg-light text-light;
  }
}

.bg-dark {
  @apply bg-gray-700;
}

.text-dark {
  @apply text-gray-200;
}

.bg-light {
  @apply bg-white;
}

.text-light {
  @apply text-gray-700;
}

/* Override the default styles when the 'dark' or 'light' class is added to the 'body' element */
body.dark #texteditor-textarea {
  @apply text-dark bg-dark;

  .md-editor-toolbar-item:hover {
    background-color: #4a5568;
  }
}

body.light #texteditor-textarea {
  @apply text-light bg-light;
}

body.dark #texteditor {
  @apply text-dark bg-dark border-gray-700;
}

body.light #texteditor {
  @apply text-light bg-light border-gray-200;
}

.md-content .md-preview,
.md-content .md-html {
  word-break: break-word;
  width: 100%;
  font-size: 1rem;
}
.md-content .md-preview,
.md-content .md-html {
  word-break: break-word;
  width: 100%;
  padding: 0;
  margin: 0;
}
#md-editor-v3-preview {
  p,
  ul,
  ol,
  blockquote > li {
    font-size: 1rem;
    word-break: break-word;
  }
}
.md-editor-footer {
  display: none;
}
</style>
