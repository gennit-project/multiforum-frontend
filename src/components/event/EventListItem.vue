<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { useRoute } from "vue-router";
import { EventData } from "@/types/eventTypes";
import { getDatePieces } from "@/utils/dateTimeUtils";
import { CommentSectionData } from "../../types/commentTypes";
import Tag from "@/components/Tag.vue";
import HighlightedSearchTerms from "../HighlightedSearchTerms.vue";
import { DateTime } from "luxon";

export default defineComponent({
  setup(props) {
    const route = useRoute();
    const startTimeObj = DateTime.fromISO(props.event.startTime);

    const { timeOfDay, weekday, month, day, year } =
      getDatePieces(startTimeObj);

    const now = DateTime.now();
    const currentYear = now.year;

    const formattedDate = `${weekday}, ${month} ${day}${year !== currentYear ? ", " + year : ""
      }`;

    const eventIdInParams = computed(() => {
      if (typeof route.params.eventId === "string") {
        return route.params.eventId;
      }
      return "";
    });

    return {
      eventIdInParams,
      formattedDate,
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
      required: true
    }
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
      return `/${this.showMap ? 'map' : 'events/list'}/search/${this.event.id}`;
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
  },
  data(props) {
    return {
      previewIsOpen: false,
      isWithinChannel: props.currentChannelId ? true : false,
      defaultUniqueName: props.event.Channels[0]
        ? props.event.Channels[0].uniqueName
        : "cluse",
    };
  },
  components: {
    Tag,
    HighlightedSearchTerms,
  },
});
</script>

<template>
  <li :ref="`#${event.id}`" :class="[
    event.id === eventIdInParams ? 'bg-slate-100' : '',
  ]" class="relative bg-white pl-4 cursor-pointer" @click="$emit('openPreview')">
    <router-link :to="previewLink">
      <div class="block">
        <div class="py-2">
          <div class="flex items-center">
            <p class="space-x-2">
              <span class="
                  text-lg
                  font-bold
                  truncate
                  cursor-pointer
                ">
                <HighlightedSearchTerms :text="event.title" :search-input="searchInput" />
              </span>

              <span class="text-red-800 bg-red-100 py-1 text-sm rounded-lg px-3" v-if="event.canceled">Canceled</span>
            </p>
          </div>
          <div v-if="event.description" class="items-center">
            <p class="text-sm font-medium text-gray-600 truncate">
              <HighlightedSearchTerms :text="event.description" :search-input="searchInput" />
            </p>
            <p v-if="event.free" class="text-sm font-medium text-gray-600 truncate">
              Free
            </p>
          </div>


          <p class="mt-2 flex flex-wrap text-sm text-gray-500 sm:mt-1 sm:mr-6 space-x-2">
            
            {{ `${formattedDate} at ${timeOfDay}${event.locationName ? ',' : ''} ${event.locationName || ''}` }}
          </p>
          <div v-if="event.virtualEventUrl">
            <Tag :tag="'Online event'" />
          </div>


          <div class="text-sm" v-if="!isWithinChannel">
            <Tag class="my-1"
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
          <Tag 
            :key="tag" 
            :active="!!selectedTagsMap[tag.text]" 
            v-for="tag in event.Tags" 
            :tag="tag.text"
            @click="$emit('filterByTag', tag.text)" 
          />
        </div>
      </div>
    </router-link>
  </li>
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>
