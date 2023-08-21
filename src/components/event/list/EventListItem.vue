<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { useRoute } from "vue-router";
import { Event } from "@/__generated__/graphql";
import { getDatePieces } from "@/utils/dateTimeUtils";
import Tag from "@/components/tag/Tag.vue";
import HighlightedSearchTerms from "../../generic/HighlightedSearchTerms.vue";
import { DateTime } from "luxon";
import { SearchEventValues } from "@/types/eventTypes";

export default defineComponent({
  components: {
    Tag,
    HighlightedSearchTerms,
  },
  props: {
    event: {
      type: Object as PropType<Event>,
      required: true,
    },
    selectedTags: {
      type: Array as PropType<string[]>,
      default: () => {
        return [];
      },
    },
    selectedChannels: {
      type: Array as PropType<string[]>,
      default: () => {
        return [];
      },
    },
    currentChannelId: {
      type: String,
      required: true,
    },
    searchInput: {
      type: String,
      default: "",
    },
    showMap: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const startTimeObj = DateTime.fromISO(props.event.startTime);

    const { timeOfDay, weekday, month, day, year } =
      getDatePieces(startTimeObj);

    const now = DateTime.now();
    const currentYear = now.year;

    const formattedDate = `${weekday}, ${month} ${day}${
      year !== currentYear ? ", " + year : ""
    }`;

    const eventIdInParams = computed(() => {
      if (typeof route.params.eventId === "string") {
        return route.params.eventId;
      }
      return "";
    });

    const defaultUniqueName = computed(() => {
      if (props.currentChannelId) {
        return props.currentChannelId;
      }
      if (props.event.EventChannels[0]) {
        return props.event.EventChannels[0].channelUniqueName;
      }
      return "";
    });

    return {
      defaultUniqueName,
      eventIdInParams,
      formattedDate,
      route,
      timeOfDay,
    };
  },
  data(props) {
    return {
      hover: false,
      previewIsOpen: false,
      isWithinChannel: props.currentChannelId ? true : false,
    };
  },
  computed: {
    selectedTagsMap() {
      let obj: any = {};
      for (let i = 0; i < this.selectedTags.length; i++) {
        const tag = this.selectedTags[i];
        obj[tag] = true;
      }
      return obj;
    },
    previewLink() {
      if (!this.event) {
        return "";
      }
      if (
        this.$route.name === "MapView" ||
        this.$route.name === "MapEventPreview"
      ) {
        return `/map/search/${this.event.id}`;
      }
      if (this.$route.name === "SitewideSearchEventPreview") {
        return `/events/list/search/${this.event.id}`;
      }
      if (this.$route.name === "SearchEventPreview") {
        return `/channels/c/${this.currentChannelId}/events/search/${this.event.id}`;
      }
      return ``;
    },
  },
  methods: {
    // getCommentCount(commentSection: CommentSectionData) {
    //   const count = commentSection.CommentsAggregate.count;
    //   return ` ${count} comment${count === 1 ? "" : "s"}`;
    // },
    // getChannel(commentSection: CommentSectionData) {
    //   return commentSection.Channel.uniqueName;
    // },
    handleClickTag(tagText: string) {
      const currentQuery = this.$route.query;

      if (currentQuery.tags) {
        if (
          typeof currentQuery.tags === "string" &&
          tagText === currentQuery.tags
        ) {
          // If we're already filtering by the tag, clear it.
          const newQuery = { ...this.$route.query };
          delete newQuery["tags"];

          this.$router.replace({
            query: {
              ...newQuery,
            },
          });
        } else if (
          typeof currentQuery.tags === "object" &&
          currentQuery.tags.includes(tagText)
        ) {
          // If we're already filtering by multiple tags including this tag,
          // remove only this tag.
          const newQuery = { ...this.$route.query };
          newQuery.tags = newQuery.tags.filter((tag: string) => {
            return tag !== tagText;
          });

          this.$router.replace({
            query: {
              ...newQuery,
            },
          });
        } else {
          // If we are not already filtering by the tag,
          // overwrite existing tag filters with it.
          this.updateFilters({ tags: [tagText] });
        }
      } else {
        this.updateFilters({ tags: [tagText] });
      }
    },
    handleClickChannel(uniqueName: string) {
      const currentQuery = this.$route.query;

      if (currentQuery.channels) {
        if (
          typeof currentQuery.channels === "string" &&
          uniqueName === currentQuery.channels
        ) {
          // If we're already filtering by the channel, clear it.
          const newQuery = { ...this.$route.query };
          delete newQuery["channels"];

          this.$router.replace({
            query: {
              ...newQuery,
            },
          });
        } else if (
          typeof currentQuery.channels === "object" &&
          currentQuery.channels.includes(uniqueName)
        ) {
          // If we're already filtering by multiple channels including this channel,
          // remove only this channel.
          const newQuery = { ...this.$route.query };
          newQuery.channels = newQuery.channels.filter((channel: string) => {
            return channel !== uniqueName;
          });

          this.$router.replace({
            query: {
              ...newQuery,
            },
          });
        } else {
          // If we are not already filtering by the channel,
          // overwrite existing channel filters with it.
          this.updateFilters({ channels: [uniqueName] });
        }
      } else {
        this.updateFilters({ channels: [uniqueName] });
      }
    },
    goToPreviewLink() {
      const existingQuery = this.$route.query;
      this.$router.push({
        path: this.previewLink,
        query: existingQuery,
      });
    },
    updateFilters(params: SearchEventValues) {
      const existingQuery = this.$route.query;
      // Updating the URL params causes the events
      // to be refetched by the EventListView
      // and MapView components
      this.$router.replace({
        query: {
          ...existingQuery,
          ...params,
        },
      });
    },
  },
});
</script>

<template>
  <li
    :ref="`#${event.id}`"
    :class="
      hover || event.id === route.params.eventId
        ? 'border-blue-500 px-4'
        : 'border-blue-200 '
    "
    class="relative border-l-4 bg-white pb-2 pl-6 pt-3 dark:bg-gray-800"
    :data-testid="`event-list-item-${event.title}`"
    @click="$emit('openPreview')"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div @click="goToPreviewLink">
      <div class="block">
        <div class="py-1">
          <div class="flex">
            <div
              class="mr-4 flex h-16 w-16 flex-col items-center justify-center rounded-lg pt-3"
            >
              <div
                class="font-semibold text-xs uppercase text-gray-500 dark:text-gray-200"
              >
                {{
                  new Date(event.startTime).toLocaleString("en-US", {
                    weekday: "short",
                  })
                }}
              </div>
              <div class="text-2xl font-bold">
                {{ new Date(event.startTime).getDate() }}
              </div>
              <div
                class="font-semibold text-xs lowercase text-gray-500 dark:text-gray-200"
              >
                {{
                  new Date(event.startTime).toLocaleString("en-US", {
                    month: "short",
                  })
                }}
              </div>
            </div>
            <div>
              <p class="space-x-2">
                <span
                  class="text-md cursor-pointer truncate font-bold dark:text-gray-100 hover:underline"
                >
                  <HighlightedSearchTerms
                    :text="event.title"
                    :search-input="searchInput"
                  />
                </span>

                <span
                  v-if="event.canceled"
                  class="rounded-lg bg-red-100 px-3 py-1 text-sm text-red-800 dark:bg-red-900 dark:text-white"
                >Canceled</span>
              </p>
              <p
                class="mt-2 flex flex-wrap space-x-2 text-sm text-gray-500 dark:text-gray-200 sm:mr-6 sm:mt-1"
              >
                {{ `${event.locationName || ""}` }}
              </p>
              <p v-if="event.virtualEventUrl">
                Online event
              </p>
              <p
                v-if="event.free"
                class="font-medium text-sm text-gray-600"
              >
                Free
              </p>
              <div
                v-if="!isWithinChannel"
                class="flex space-x-1 text-sm"
              >
                <Tag
                  v-for="ec in event.EventChannels"
                  :key="ec.channelUniqueName"
                  class="my-1"
                  :active="selectedChannels.includes(ec.channelUniqueName)"
                  :channel-mode="true"
                  :tag="ec.channelUniqueName"
                  @click="
                    () => {
                      handleClickChannel(ec.channelUniqueName);
                    }
                  "
                />
              </div>
              <p
                class="font-medium mt-1 flex space-x-1 text-sm text-gray-600 hover:no-underline"
              >
                <Tag
                  v-for="tag in event.Tags"
                  :key="tag"
                  class="my-1"
                  :active="selectedTags.includes(tag.text)"
                  :tag="tag.text"
                  @click="
                    () => {
                      handleClickTag(tag.text);
                    }
                  "
                />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </li>
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>
