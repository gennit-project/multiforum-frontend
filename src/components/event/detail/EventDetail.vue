<script lang="ts">
import { defineComponent, computed } from "vue";
import Tag from "@/components/tag/Tag.vue";
import { useQuery } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { ChannelData } from "@/types/channelTypes";
import { GET_EVENT } from "@/graphQLData/event/queries";
import { EventData } from "@/types/eventTypes";
import { relativeTime } from "../../../dateTimeUtils";
import { DateTime } from "luxon";
import ErrorBanner from "../../generic/ErrorBanner.vue";
import "md-editor-v3/lib/style.css";
import LeftArrowIcon from "../../icons/LeftArrowIcon.vue";
import EventFooter from "./EventFooter.vue";
import MdEditor from "md-editor-v3";
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
    class="height-constrained-more pb-36 px-4 lg:w-full space-y-2 flex justify-center"
  >
    <div
      :class="
        route.name === 'EventDetail' && mdAndUp
          ? 'large-width'
          : 'w-full mx-4'
      "
      class="pb-36 space-y-2"
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

      <div v-else-if="eventResult && eventResult.events && eventData">
        <ErrorBanner
          class="mt-2 mb-2"
          v-if="eventIsInThePast"
          :text="'This event is in the past.'"
        />
        <ErrorBanner
          class="mt-2 mb-2"
          v-if="eventData.canceled"
          :text="'This event is canceled.'"
        />
        <EventHeader :event-data="eventData" />
        <div class="px-4 lg:px-10">
          <md-editor
            v-if="eventData.description"
            class="max-w-2xl small-text"
            v-model="eventData.description"
            previewTheme="vuepress"
            language="en-US"
            :noMermaid="true"
            preview-only
          />
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
<style scoped>
li {
  margin-top: 0.5em;
}
.hanging-indent {
  padding-left: 32px;
  text-indent: -32px;
}
.height-constrained-more {
  max-height: 50vh;
  height: 100% - 150px;
}
.large-width {
  width: 900px;
}
</style>
