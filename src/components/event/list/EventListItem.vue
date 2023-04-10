<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { useRoute } from "vue-router";
import { EventData } from "@/types/eventTypes";
import { getDatePieces } from "@/utils/dateTimeUtils";
import { CommentSectionData } from "../../../types/commentTypes";
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
      if (this.isWithinChannel) {
        return `/channels/c/${this.defaultUniqueName}/events/search/${this.event.id}`;
      }
      return `/${this.showMap ? "map" : "events/list"}/search/${this.event.id}`;
    },
  },
  methods: {
    getCommentCount(commentSection: CommentSectionData) {
      const count = commentSection.CommentsAggregate.count;
      return ` ${count} comment${count === 1 ? "" : "s"}`;
    },
    getChannel(commentSection: CommentSectionData) {
      return commentSection.Channel.uniqueName;
    },
    handleClickTag(tagText: string){
      const currentQuery = this.$route.query;

      if (currentQuery.tags){
        if (typeof currentQuery.tags === 'string' && tagText === currentQuery.tags) {
          // If we're already filtering by the tag, clear it.
          const newQuery = {...this.$route.query};
          delete newQuery['tags']

          this.$router.replace({
            query: {
              ...newQuery
            }
          })
        } else if (typeof currentQuery.tags === 'object' && currentQuery.tags.includes(tagText)){
          // If we're already filtering by multiple tags including this tag,
          // remove only this tag.
          const newQuery = {...this.$route.query};
          newQuery.tags = newQuery.tags.filter((tag: string) => {
            return tag !== tagText;
          })

          this.$router.replace({
            query: {
              ...newQuery
            }
          })
        } else {
          // If we are not already filtering by the tag,
          // overwrite existing tag filters with it.
          this.updateFilters({ tags: [tagText] })
        }
      } else {
        this.updateFilters({ tags: [tagText] })
      }
    },
    goToPreviewLink(){
      const existingQuery = this.$route.query;
      this.$router.push({
        path: this.previewLink,
        query: existingQuery
      })
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
      hover:           false,
      previewIsOpen:   false,
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
    :class="hover || event.id === route.params.eventId ? 'border-blue-500 shadow-lg' : 'border-blue-200 shadow-sm'"
    class="relative bg-white pl-6 pt-3 pb-2 cursor-pointer border-l-4 m-3 rounded-lg  \"
    @click="$emit('openPreview')"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div @click="goToPreviewLink">
      <div class="block">
        <div class="py-1">
          <div class="flex items-center">
            <p class="space-x-2">
              <span class="text-lg font-bold truncate cursor-pointer">
                <HighlightedSearchTerms
                  :text="event.title"
                  :search-input="searchInput"
                />
              </span>

              <span
                class="text-red-800 bg-red-100 py-1 text-sm rounded-lg px-3"
                v-if="event.canceled"
                >Canceled</span
              >
            </p>
          </div>
          <div v-if="event.description" class="items-center">
            <p class="text-sm font-medium text-gray-600 truncate">
              <HighlightedSearchTerms
                :text="event.description"
                :search-input="searchInput"
              />
            </p>
            <p
              v-if="event.free"
              class="text-sm font-medium text-gray-600 truncate"
            >
              Free
            </p>
          </div>

          <p
            class="
              mt-2
              flex flex-wrap
              text-sm text-gray-500
              sm:mt-1 sm:mr-6
              space-x-2
            "
          >
            {{
              `${formattedDate} at ${timeOfDay}${
                event.locationName ? "," : ""
              } ${event.locationName || ""}`
            }}
          </p>
          <div v-if="event.virtualEventUrl">
            <Tag :tag="'Online event'" />
          </div>

          <div class="text-sm" v-if="!isWithinChannel">
            <Tag
              class="my-1"
              :active="selectedChannels.includes(channel.uniqueName)"
              :key="channel.uniqueName"
              :channel-mode="true"
              v-for="channel in event.Channels"
              :tag="channel.uniqueName"
              @click="$emit('filterByChannel', channel.uniqueName)"
            />
          </div>

          <!-- <div class="text-sm">
          <router-link
            v-if="isWithinChannel && event.CommentSections[0]"
            :to="`/channels/c/${defaultUniqueName}/events/e/${event.id}`"
            class="font-medium text-gray-500"
          >
            {{ getCommentCount(event.CommentSections[0]) }}
            <span aria-hidden="true">&rarr;</span>
          </router-link>

          <router-link
            v-else
            :key="getChannel(commentSection)"
            v-for="(commentSection, i) in event.CommentSections"
            :to="`/channels/c/${getChannel(commentSection)}/events/e/${event.id}`"
            class="font-medium"
          >
            {{ getCommentCount(commentSection) }} in
            <span class="text-gray-800"
              >channels/<HighlightedSearchTerms
                :text="getChannel(commentSection)"
                :search-input="selectedChannels.join(' ')"
            /></span>
            {{ i === event.CommentSections.length - 1 ? "" : "•" }}
          </router-link>
        </div> -->
        </div>
      </div>
    </div>
    <Tag
      class="mb-2"
      :key="tag"
      :active="!!selectedTagsMap[tag.text]"
      v-for="tag in event.Tags"
      :tag="tag.text"
      @click="() => {
        handleClickTag(tag.text)
      }"
    />
  </li>
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>
