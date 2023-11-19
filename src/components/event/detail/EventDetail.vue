<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import Tag from "@/components/tag/Tag.vue";
import { useQuery } from "@vue/apollo-composable";
import { useRoute } from "vue-router";
import { GET_EVENT } from "@/graphQLData/event/queries";
import { Event, EventChannel } from "@/__generated__/graphql";
import { relativeTime } from "../../../dateTimeUtils";
import { DateTime } from "luxon";
import ErrorBanner from "../../generic/ErrorBanner.vue";
import "md-editor-v3/lib/style.css";
import EventFooter from "./EventFooter.vue";
import { useDisplay } from "vuetify";
import EventHeader from "./EventHeader.vue";
import GenericButton from "@/components/generic/buttons/GenericButton.vue";
import RequireAuth from "@/components/auth/RequireAuth.vue";
import CreateButton from "@/components/generic/buttons/CreateButton.vue";
import PrimaryButton from "@/components/generic/buttons/PrimaryButton.vue";
import MarkdownPreview from "@/components/generic/forms/MarkdownPreview.vue";
import BackLink from "@/components/generic/buttons/BackLink.vue";

export default defineComponent({
  components: {
    BackLink,
    ErrorBanner,
    EventFooter,
    EventHeader,
    CreateButton,
    GenericButton,
    RequireAuth,
    PrimaryButton,
    Tag,
    MarkdownPreview,
  },
  props: {
    compactMode: {
      type: Boolean,
      default: false,
    },
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
      const event: Event = eventResult.value.events[0];
      const eventChannels = event.EventChannels;
      const channelsExceptCurrent = eventChannels.filter((ec: EventChannel) => {
        return ec.channelUniqueName !== channelId.value;
      });
      return channelsExceptCurrent;
    });

    // Each event can have multiple comment sections
    // because there's a different comment section for each
    // channel that the event is in.
    // The idea is to show the comments that correspond
    // to the channel in the current URL.
    let discussionChannelId: string = "";

    if (typeof eventId.value === "string") {
      discussionChannelId = eventId.value + channelId.value;
    } else {
      console.warn("Event ID is not a string: " + eventId.value);
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
      discussionChannelId,
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
  created() {
    window.scrollTo(0, 0);
  },
  methods: {
    openLink() {
      window.open(this.eventData.virtualEventUrl, "_blank");
    },
    addToGoogleCalendar() {
      const googleCalendarDateFormat = "yyyyMMdd'T'HHmmss";
      let start = DateTime.fromISO(this.eventData.startTime).toFormat(
        googleCalendarDateFormat,
      );
      let end = DateTime.fromISO(this.eventData.endTime).toFormat(
        googleCalendarDateFormat,
      );

      const baseUrl = "https://www.google.com/calendar/render";
      const location = this.eventData.address
        ? encodeURIComponent(this.eventData.address)
        : encodeURIComponent(this.eventData.virtualEventUrl);
      const name = encodeURIComponent(this.eventData.title);
      const details = encodeURIComponent(this.eventData.description);

      const googleUrl = `${baseUrl}?action=TEMPLATE&text=${name}&dates=${start}/${end}&details=${details}&location=${location}`;
      window.open(googleUrl, "_blank");
    },
    addToiCal() {
      const data = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `URL:${document.URL}`,
        `DTSTART:${this.eventData.startTime.replace(/-|:|\.\d{3}/g, "")}`,
        `DTEND:${this.eventData.endTime.replace(/-|:|\.\d{3}/g, "")}`,
        `SUMMARY:${this.eventData.title}`,
        `DESCRIPTION:${this.eventData.description}`,
        `LOCATION:${this.eventData.address}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\n");

      const blob = new Blob([data], { type: "text/calendar;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "event.ics");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    addToOutlook() {
      // For Outlook, you can use the same iCal method, because Outlook supports iCal files.
      // Alternatively, if you want to create a link to Outlook Calendar's web version, you would construct a URL like the Google Calendar one.
      this.addToiCal();
    },
  },
});
</script>

<template>
  <div
    class="w-full space-y-4 overflow-auto rounded-lg bg-gray-100 py-1 dark:bg-gray-800 lg:px-8"
  >
    <div class="mb-10 flex w-full justify-center rounded-lg">
      <div class="w-full">
        <div
          v-if="route.name === 'EventDetail'"
          :class="'align-center mt-2 flex justify-between'"
        >
          <BackLink :link="`/channels/c/${channelId}/events/search`" />
          <div
            v-if="channelId && eventData"
            class="mt-4 flex flex-shrink-0 items-center md:ml-4 md:mt-0"
          >
            <RequireAuth
              v-if="eventData.Poster"
              class="flex inline-flex"
              :require-ownership="true"
              :owners="[eventData.Poster.username]"
            >
              <template #has-auth>
                <router-link
                  :to="`/channels/c/${channelId}/events/e/${eventId}/edit`"
                >
                  <GenericButton
                    :text="'Edit'"
                    data-testid="edit-event-button"
                  />
                </router-link>
              </template>
            </RequireAuth>
            <RequireAuth class="flex inline-flex">
              <template #has-auth>
                <CreateButton
                  class="ml-2"
                  data-testid="real-create-event-button"
                  :to="`/channels/c/${channelId}/events/create`"
                  :label="'Create Event'"
                />
              </template>
              <template #does-not-have-auth>
                <PrimaryButton
                  data-testid="fake-create-event-button"
                  class="ml-2"
                  :label="'Create Event'"
                />
              </template>
            </RequireAuth>
          </div>
        </div>

        <div class="mt-1 w-full space-y-2 px-3">
          <p
            v-if="eventLoading"
            class="px-4 lg:px-10"
          >
            Loading...
          </p>
          <ErrorBanner
            v-else-if="eventError"
            class="px-4 lg:px-10"
            :text="eventError.message"
          />

          <div v-else-if="!eventData">
            <p>Could not find the event.</p>
          </div>

          <div
            v-else-if="eventResult && eventResult.events && eventData"
            class="dark:bg-dark-700 mx-auto max-w-2xl pt-4"
          >
            <ErrorBanner
              v-if="eventIsInThePast"
              class="mb-2 mt-2"
              :text="'This event is in the past.'"
            />
            <ErrorBanner
              v-if="eventData.canceled"
              data-testid="canceled-event-banner"
              class="my-2"
              :text="'This event is canceled.'"
            />
            <div
              class="mb-4 dark:text-gray-100 md:flex md:items-center md:justify-between"
            >
              <div class="min-w-0 flex-1">
                <h2 class="text-wrap px-1 text-2xl font-bold sm:tracking-tight">
                  {{ eventData.title }}
                </h2>
              </div>
            </div>
            <div
              class="rounded-md border bg-white p-8 dark:border-gray-800 dark:bg-gray-700"
            >
              <EventHeader :event-data="eventData" />
              <MarkdownPreview
                v-if="eventData.description"
                :text="visibleDescription"
                :disable-gallery="false"
                class="-ml-4"
              />
              <button
                v-if="
                  eventData?.description &&
                    eventData.description.split(' ').length > 50
                "
                class="mt-2 rounded bg-black px-4 py-2 font-bold text-white hover:bg-blue-700"
                @click="toggleDescription"
              >
                {{ showFullDescription ? "Show less" : "Show more" }}
              </button>

              <div class="p-4">
                <h2 class="text-md mt-4">
                  Add to Calendar
                </h2>
                <hr>
                <div class="mt-4 flex">
                  <div class="flex flex-row gap-2 text-sm">
                    <div class="flex justify-start">
                      <span
                        class="cursor-pointer underline"
                        @click="addToGoogleCalendar"
                      >Google Calendar</span>
                    </div>
                    <div class="flex justify-center">
                      <span
                        class="cursor-pointer underline"
                        @click="addToiCal"
                      >iCal</span>
                    </div>
                    <div class="flex justify-end">
                      <span
                        class="cursor-pointer underline"
                        @click="addToOutlook"
                      >Outlook</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="mx-4 my-2">
              <div class="flex space-x-1">
                <Tag
                  v-for="tag in eventData.Tags"
                  :key="tag.text"
                  class="mt-2"
                  :tag="tag.text"
                  :event-id="eventId"
                />
              </div>

              <div
                v-if="channelId && channelsExceptCurrent.length > 0"
                class="mt-2"
              >
                Crossposted To Channels
              </div>
              <div class="flex space-x-1">
                <router-link
                  v-for="ec in channelsExceptCurrent"
                  :key="ec.channelUniqueName"
                  :to="`/channels/c/${ec.channelUniqueName}/events/e/${eventId}`"
                >
                  <Tag
                    class="mt-2"
                    :tag="ec.channelUniqueName"
                    :channel-mode="true"
                  />
                </router-link>
              </div>
            </div>
            <EventFooter
              :event-data="eventData"
              :channels-except-current="channelsExceptCurrent"
            />
          </div>
        </div>
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
