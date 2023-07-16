<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { useRoute } from "vue-router";
import { EventData } from "@/types/eventTypes";
import { getDatePieces } from "@/utils/dateTimeUtils";
import Tag from "@/components/tag/Tag.vue";
import HighlightedSearchTerms from "../../generic/HighlightedSearchTerms.vue";
import { DateTime } from "luxon";
import { SearchEventValues } from "@/types/eventTypes";

export default defineComponent({
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
      if (props.event.Channels[0]) {
        return props.event.Channels[0].uniqueName;
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
  props: {
    event: {
      type: Object as PropType<EventData>,
      required: true,
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
  data(props) {
    return {
      hover: false,
      previewIsOpen: false,
      isWithinChannel: props.currentChannelId ? true : false,
    };
  },
  components: {
    Tag,
    HighlightedSearchTerms,
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
    class="relative bg-white dark:bg-gray-900 pl-6 pt-3 pb-2 border-l-4"
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
              class="w-16 h-16 pt-3 flex flex-col justify-center items-center rounded-lg mr-4"
            >
              <div class="text-xs uppercase text-gray-500 dark:text-gray-200 font-semibold">
                {{
                  new Date(event.startTime).toLocaleString("en-US", {
                    weekday: "short",
                  })
                }}
              </div>
              <div class="text-2xl font-bold">
                {{ new Date(event.startTime).getDate() }}
              </div>
              <div class="text-xs lowercase text-gray-500 dark:text-gray-200 font-semibold">
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
                  class="text-md font-bold truncate cursor-pointer hover:underline"
                >
                  <HighlightedSearchTerms
                    :text="event.title"
                    :search-input="searchInput"
                  />
                </span>

                <span
                  class="text-red-800 bg-red-100 dark:text-white dark:bg-red-900 py-1 text-sm rounded-lg px-3"
                  v-if="event.canceled"
                  >Canceled</span
                >
              </p>
              <p
                class="mt-2 flex flex-wrap text-sm text-gray-500 sm:mt-1 sm:mr-6 space-x-2"
              >
                {{ `${event.locationName || ""}` }}
              </p>
              <p v-if="event.virtualEventUrl">Online event</p>
              <p v-if="event.free" class="text-sm font-medium text-gray-600">
                Free
              </p>
              <div class="text-sm" v-if="!isWithinChannel">
                <Tag
                  class="my-1"
                  :active="selectedChannels.includes(channel.uniqueName)"
                  :key="channel.uniqueName"
                  :channel-mode="true"
                  v-for="channel in event.Channels"
                  :tag="channel.uniqueName"
                  @click="
                    () => {
                      handleClickChannel(channel.uniqueName);
                    }
                  "
                />
              </div>
              <p
                class="text-sm text-slate-600 hover:no-underline font-medium mt-1"
              >
                <Tag
                  class="my-1"
                  :active="selectedTags.includes(tag.text)"
                  :key="tag"
                  v-for="tag in event.Tags"
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
