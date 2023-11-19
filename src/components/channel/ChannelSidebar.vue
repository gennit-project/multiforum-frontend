<script lang="ts">
import { defineComponent, computed, ref, PropType } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import Tag from "@/components/tag/Tag.vue";
import "md-editor-v3/lib/style.css";
import { useDisplay } from "vuetify";
import Avatar from "../user/Avatar.vue";
import gql from "graphql-tag";
import UsernameWithTooltip from "../generic/UsernameWithTooltip.vue";
import { EventChannel, Event, Channel } from "@/__generated__/graphql";
import { DateTime } from "luxon";
import MarkdownPreview from "../generic/forms/MarkdownPreview.vue";

const getDateSectionFormat = (date: string) => {
  const dateObj = DateTime.fromISO(date);
  // The date should be in the format "Thu Nov 9"
  return dateObj.toLocaleString({
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export default defineComponent({
  name: "AboutPage",
  components: {
    Tag,
    Avatar,
    MarkdownPreview,
    UsernameWithTooltip,
  },
  props: {
    channel: {
      type: Object as PropType<Channel>,
      required: true,
    },
    eventChannels: {
      type: Array as PropType<Array<EventChannel>>,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const eventChannelsAggregate = computed(() => {
      if (props.channel) {
        return props.channel?.EventChannelsAggregate?.count ?? 0;
      }
      return 0;
    });

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    const tags = computed(() => {
      if (props.channel) {
        return props.channel.Tags;
      }
      return [];
    });

    const admins = computed(() => {
      if (props.channel) {
        return props.channel.Admins;
      }
      return [];
    });

    const ownerList = computed(() => {
      // Used to determine whether the logged in
      // user should be able to see the buttons for
      // admin actions
      return admins.value.map((adminData: any) => adminData.username);
    });

    const { mdAndDown } = useDisplay();
    const GET_THEME = gql`
      query getTheme {
        theme @client
      }
    `;

    const {
      result: themeResult,
      loading: themeLoading,
      error: themeError,
    } = useQuery(GET_THEME);

    const theme = computed(() => {
      if (themeLoading.value || themeError.value) {
        return "";
      }
      return themeResult.value.theme;
    });

    let dateObj: any = {
      happeningNow: [],
      happeningToday: [],
      happeningTomorrow: [],
      afterTomorrow: [],
    };

    const happeningNow = (e: Event) => {
      // We consider an event to be happening now if the start time is in the past
      // and the end time is in the future
      return (
        e.startTime < new Date().toISOString() && // start time is in the past
        e.endTime > new Date().toISOString()
      ); // end time is in the future
    };

    const happeningToday = (e: Event) => {
      const startTime = DateTime.fromISO(e.startTime ?? "");
      const now = DateTime.now();
      return (
        startTime.day === now.day &&
        startTime.month === now.month &&
        startTime.year === now.year
      );
    };

    const happeningTomorrow = (e: Event) => {
      const startTime = DateTime.fromISO(e.startTime ?? "");
      const tomorrow = DateTime.now().startOf("day").plus({ days: 1 });
      return (
        startTime.day === tomorrow.day &&
        startTime.month === tomorrow.month &&
        startTime.year === tomorrow.year
      );
    };

    const afterTomorrow = (e: Event) => {
      const startTime = DateTime.fromISO(e.startTime ?? "");
      const tomorrow = DateTime.now().startOf("day").plus({ days: 1 });
      return startTime > tomorrow;
    };

    for (let i = 0; i < props.eventChannels.length; i++) {
      const event = props.eventChannels[i]?.Event;

      if (!event) {
        continue;
      }

      if (happeningNow(event)) {
        dateObj.happeningNow.push(event);
      } else if (happeningToday(event)) {
        dateObj.happeningToday.push(event);
      } else if (happeningTomorrow(event)) {
        dateObj.happeningTomorrow.push(event);
      } else if (afterTomorrow(event)) {
        dateObj.afterTomorrow.push(event);
      }
    }

    let dateSectionObj: any = {};

    for (let i = 0; i < dateObj.afterTomorrow.length; i++) {
      const event = dateObj.afterTomorrow[i];
      const date = getDateSectionFormat(event.startTime ?? "");
      if (!dateSectionObj[date]) {
        dateSectionObj[date] = [];
      }
      dateSectionObj[date].push(event);
    }

    return {
      admins,
      afterTomorrow,
      channelId,
      confirmDeleteIsOpen: ref(false),
      eventChannelsAggregate,
      dateObj,
      dateSectionObj,
      mdAndDown,
      ownerList,
      router,
      tags,
      theme,
    };
  },

  methods: {
    filterChannelsByTag(tag: string) {
      this.router.push({
        name: "FilterChannelsByTag",
        params: {
          tag,
        },
      });
    },
    getSidebarLinkText(event: Event) {
      // If event.isAllDay is true,
      // simply return event?.title.
      // Otherwise, state the title in this format:
      // "10:00 AM · Event Title"
      if (event.isAllDay) {
        return event.title ?? "";
      }
      const startTime = DateTime.fromISO(event.startTime ?? "");
      return `${startTime.toLocaleString(DateTime.TIME_SIMPLE)} · ${
        event.title
      }`;
    },
  },
});
</script>

<template>
  <div
    class="max-h-screen overflow-auto rounded-lg bg-white pb-8 dark:bg-gray-800"
  >
    <div
      v-if="channelId"
      class="items-center gap-2"
    >     
      <div class="p-6">
        <Avatar
          class="border-2 shadow-sm dark:border-gray-800"
          :text="channelId"
          :src="channel?.channelIconURL ?? ''"
          :is-square="true"
        />
        <h1
          v-if="channelId && !channel?.displayName"
          class="mb-2 mt-4 flex border-gray-700 text-2xl font-bold leading-6 text-gray-500 dark:text-gray-200"
        >
          {{ channelId }}
        </h1>
        <div v-if="channel?.displayName">
          <h1
            class="mb-2 mt-4 flex border-gray-700 text-2xl font-bold leading-6 text-gray-500 dark:text-gray-200"
          >
            {{ channel?.displayName }}
          </h1>
          <span
            class="text-sm font-bold leading-6 text-gray-500 dark:text-gray-300"
          >
            {{ channelId }}
          </span>
        </div>
      </div>
    </div>

    <div class="w-full">
      <div v-if="channel">
        <div class="mb-4 w-full px-4">
          <MarkdownPreview
            v-if="channel.description"
            :text="channel.description"
            :word-limit="1000"
          />
        </div>
        <slot />

        <div class="mt-6 w-full">
          <div v-if="channel.Tags.length > 0">
            <div class="flex justify-between border-gray-300">
              <span
                class="my-2 mb-2 px-6 text-sm font-bold leading-6 text-gray-500 dark:text-gray-300"
              >
                Tags
              </span>
            </div>

            <div class="mb-6 mt-2 flex flex-wrap px-6">
              <Tag
                v-for="tag in channel.Tags"
                :key="tag.text"
                class="mb-1"
                :tag="tag.text"
                @click="filterChannelsByTag(tag.text)"
              />
            </div>
          </div>

          <div
            v-if="dateObj.happeningNow.length > 0"
            class="flex flex-col px-6"
          >
            <span
              class="my-2 mb-2 text-sm font-bold leading-6 text-gray-500 dark:text-gray-400"
            >
              Happening Now
            </span>
            <div
              v-for="event in dateObj.happeningNow"
              :key="event?.id"
              class="my-1 mb-2 flex flex-col gap-2 border-l-4 pl-2 text-sm font-bold leading-6 text-gray-500 dark:text-gray-300"
            >
              <router-link
                :to="`/channels/c/${channelId}/events/e/${event?.id}`"
                class="flex items-center"
              >
                <span
                  class="text-sm font-bold leading-6 text-gray-500 dark:text-gray-300"
                >
                  {{ event?.title }}
                </span>
              </router-link>
              <a
                v-if="event?.virtualEventUrl"
                target="_blank"
                :href="event?.virtualEventUrl"
                class="w-fit rounded-md bg-blue-600 px-4 py-2 text-blue-100"
              >
                Go to online event
                <i class="fa-solid fa-arrow-up-right-from-square" />
              </a>
            </div>
          </div>

          <div
            v-if="dateObj.happeningToday.length > 0"
            class="flex flex-col px-6"
          >
            <span
              class="my-2 mb-2 text-sm font-bold leading-6 text-gray-500 dark:text-gray-400"
            >
              Today
            </span>
            <div
              v-for="event in dateObj.happeningToday"
              :key="event?.id"
              class="my-1 mb-2 flex flex-col gap-2 border-l-4 pl-2 text-sm font-bold leading-6 text-gray-500 dark:text-gray-300"
            >
              <router-link
                :to="`/channels/c/${channelId}/events/e/${event?.id}`"
                class="flex items-center"
              >
                <span
                  class="text-sm font-bold leading-6 text-gray-500 dark:text-gray-300"
                >
                  {{ getSidebarLinkText(event) }}
                </span>
              </router-link>
            </div>
          </div>

          <div
            v-if="dateObj.happeningTomorrow.length > 0"
            class="flex flex-col px-6"
          >
            <span
              class="my-2 mb-2 text-sm font-bold leading-6 text-gray-500 dark:text-gray-400"
            >
              Tomorrow
            </span>
            <div
              v-for="event in dateObj.happeningTomorrow"
              :key="event?.id"
              class="my-1 mb-2 flex flex-col gap-2 border-l-4 pl-2 text-sm font-bold leading-6 text-gray-500 dark:text-gray-300"
            >
              <router-link
                :to="`/channels/c/${channelId}/events/e/${event?.id}`"
                class="flex items-center"
              >
                <span
                  class="text-sm font-bold leading-6 text-gray-500 dark:text-gray-300"
                >
                  {{ getSidebarLinkText(event) }}
                </span>
              </router-link>
            </div>
          </div>

          <div v-if="dateObj.afterTomorrow.length > 0">
            <div
              v-for="(events, date) in dateSectionObj"
              :key="date"
              class="flex flex-col px-6"
            >
              <span
                class="my-2 mb-2 text-sm font-bold leading-6 text-gray-500 dark:text-gray-400"
              >
                {{ date }}
              </span>
              <div
                v-for="event in events"
                :key="event?.id"
                class="my-1 mb-2 flex flex-col gap-2 border-l-4 pl-2 text-sm font-bold leading-6 text-gray-500 dark:text-gray-300"
              >
                <router-link
                  :to="`/channels/c/${channelId}/events/e/${event?.id}`"
                  class="flex items-center"
                >
                  <span
                    class="text-sm font-bold leading-6 text-gray-500 dark:text-gray-300"
                  >
                    {{ getSidebarLinkText(event) }}
                  </span>
                </router-link>
              </div>
            </div>
          </div>

          <div
            v-if="
              eventChannels.length > 0 &&
                eventChannelsAggregate > eventChannels.length
            "
          >
            <router-link
              :to="`/channels/c/${channelId}/events/search`"
              class="flex items-center px-8 underline"
            >
              <span class="text-sm font-bold leading-6"> View all events </span>
            </router-link>
          </div>

          <div class="flex justify-between">
            <span
              class="my-2 mt-6 px-6 text-sm font-bold leading-6 text-gray-500 dark:text-gray-400"
            >
              Admins
            </span>
          </div>
          <ul
            v-if="channel.Admins.length > 0"
            class="px-5 text-sm font-bold"
          >
            <li
              v-for="admin in channel.Admins"
              :key="admin.username"
            >
              <router-link
                :key="admin.username"
                :to="`/u/${admin.username}`"
                class="flex items-center"
              >
                <Avatar
                  :text="admin.username"
                  :src="admin.profilePicURL ?? ''"
                  class="mr-2 h-6 w-6"
                />
                <UsernameWithTooltip
                  v-if="admin.username"
                  :username="admin.username"
                  :src="admin.profilePicURL ?? ''"
                  :display-name="admin.displayName ?? ''"
                  :comment-karma="admin.commentKarma ?? 0"
                  :discussion-karma="admin.discussionKarma ?? 0"
                  :account-created="admin.createdAt ?? ''"
                />
              </router-link>
            </li>
          </ul>
          <p
            v-else
            class="mx-6 my-3 mb-6 text-sm dark:text-gray-400"
          >
            This channel does not have any admins.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
/* Apply the user's preferred color scheme by default */
@media (prefers-color-scheme: dark) {
  #md-editor-v3-preview,
  #md-editor-v3-preview-wrapper {
    background-color: black;
  }
}

@media (prefers-color-scheme: light) {
  #md-editor-v3-preview,
  #md-editor-v3-preview-wrapper {
    background-color: blue;
  }
}
</style>
