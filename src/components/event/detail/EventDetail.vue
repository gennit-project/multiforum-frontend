<script lang="ts">
import { defineComponent, computed, ref, Ref } from "vue";
import Tag from "@/components/tag/Tag.vue";
import { useQuery } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { ChannelData } from "@/types/channelTypes";
import { GET_EVENT } from "@/graphQLData/event/queries";
import { EventData } from "@/types/eventTypes";
import {
  relativeTime,
  formatDuration,
  getDurationObj,
} from "../../../dateTimeUtils";
import { DateTime } from "luxon";
import ErrorBanner from "../../generic/ErrorBanner.vue";
import "md-editor-v3/lib/style.css";
import Notification from "../../generic/Notification.vue";
import LeftArrowIcon from "../../icons/LeftArrowIcon.vue";
import getEventWhere from "@/components/event/list/getEventWhere";
import { SearchEventValues } from "@/types/eventTypes";
import { getFilterValuesFromParams } from "../list/getFilterValuesFromParams";
import { timeShortcutValues } from "../list/eventSearchOptions";
import {
  chronologicalOrder,
  reverseChronologicalOrder,
} from "../list/filterStrings";
import EventFooter from "./EventFooter.vue";
import MdEditor from "md-editor-v3";
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
    Notification,
    Tag,
  },
  setup(props, { emit }) {
    const route = useRoute();
    const router = useRouter();
    

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


    const filterValues: Ref<SearchEventValues> = ref(
      getFilterValuesFromParams(route, channelId.value)
    );

    const resultsOrder = computed(() => {
      if (filterValues.value.timeShortcut === timeShortcutValues.PAST_EVENTS) {
        return reverseChronologicalOrder;
      }
      return chronologicalOrder;
    });

    const eventWhere = computed(() => {
      return getEventWhere(filterValues.value, false, channelId.value);
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
      relativeTime,
      route,
    };
  },
  methods: {
    getFormattedDateString(startTime: string) {
      const startTimeObj = DateTime.fromISO(startTime);

      return startTimeObj.toFormat("cccc LLLL d yyyy");
    },
    getFormattedTimeString(startTime: string, endTime: string) {
      const eventDurationObj = getDurationObj(startTime, endTime);
      const formattedDuration = formatDuration(eventDurationObj);

      const startTimeObj = DateTime.fromISO(startTime);

      const formattedStartTimeString = startTimeObj.toLocaleString(
        DateTime.TIME_SIMPLE
      );
      return `${formattedStartTimeString} for ${formattedDuration}`;
    },
    openLink() {
      window.open(this.eventData.virtualEventUrl, "_blank");
    },
  },
});
</script>

<template>
  <div class="height-constrained-more pb-36 px-4 lg:w-full space-y-2">
    <router-link
      v-if="route.name === 'EventDetail'"
      :to="`/channels/c/${channelId}/events/search`"
      class="underline text-xs text-gray-500 mb-4"
    >
      <LeftArrowIcon class="h-4 w-4 mr-1 pb-1 inline-flex" />
      {{ `Event list in c/${channelId}` }}
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
      :class="route.name === 'EventDetail' ? ' overflow-y-scroll' : ''"
      class="bg-white rounded shadow-md py-4 pr-8 lg:px-10"
    >
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
      <h2
        v-if="route.name !== 'EventDetail'"
        class="pl-4 text-gray-400 text-sm"
      >
        Preview
      </h2>
      <EventHeader 
       :event-data="eventData"
      />
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
        <div v-if="channelId && channelsExceptCurrent.length > 0" class="mt-2">
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
      <Notification
        :show="showAddressCopiedNotification"
        :title="'Copied to clipboard!'"
        @closeNotification="showAddressCopiedNotification = false"
      />
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
</style>