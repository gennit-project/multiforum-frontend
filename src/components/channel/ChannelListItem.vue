<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { ChannelData } from "@/types/channelTypes";
import { gql } from "@apollo/client/core";
import { useQuery } from "@vue/apollo-composable";
import HighlightedSearchTerms from "../forms/HighlightedSearchTerms.vue";
import Tag from "../buttons/Tag.vue";
const { DateTime } = require("luxon");

export default defineComponent({
  setup() {
    const now = DateTime.now();
    const nowISO = now.toISO();

    let futureEventAggregate = computed(() => {
      try {
        return gql`
          query {
            aggregateEvent( filter: {
              startTime: {
                gt: "${nowISO}"
              }
            }) {
              count
            }
          }`;
      } catch (err) {
        throw new Error(err);
      }
    });

    const { result } = useQuery(futureEventAggregate);

    return {
      result,
    };
  },
  props: {
    channel: {
      type: Object as PropType<ChannelData>,
      required: true,
    },
    searchInput: {
      type: String,
      default: "",
    },
    selectedTags: {
      type: Array as PropType<Array<String>>,
      default: () => {
        return [];
      },
    },
  },
  data(props) {
    return {
      tags: props.channel.Tags.map((tag) => {
        return tag.text;
      }),
    };
  },
  components: {
    HighlightedSearchTerms,
    Tag,
  },
});
</script>

<template>
  <div
    class="
      relative
      rounded-lg
      border border-gray-300
      bg-white
      px-6
      py-5
      shadow-sm
      flex
      items-center
      space-x-3
    "
  >
    <div class="flex-shrink-0">
      <img class="h-10 w-10 rounded-full" alt="" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="font-large text-gray-900">
        <router-link
          :to="`/channels/${channel.url}`"
          class="focus:outline-none cursor-pointer"
        >
          channels/<HighlightedSearchTerms
            :text="channel.url"
            :search-input="searchInput"
          />
        </router-link>
      </p>

      <p class="text-sm text-gray-500 truncate">
        <HighlightedSearchTerms
          :text="channel.name"
          :search-input="searchInput"
        />
      </p>
      <p class="text-sm text-gray-500 truncate">
        <HighlightedSearchTerms
          :text="channel.description"
          :search-input="searchInput"
        />
      </p>
      <p class="text-sm text-gray-500 truncate">
        <router-link
          class="underline"
          :to="`/channels/${channel.url}/discussions`"
          >{{ channel.DiscussionsAggregate.count }} Discussions</router-link
        >,

        <router-link
          v-if="result && result.aggregateEvent"
          class="underline"
          :to="`/channels/${channel.url}/events`"
        >
          {{ result.aggregateEvent.count }} Future Events</router-link
        >
      </p>
      <Tag
        :highlighted="selectedTags.indexOf(tag) !== -1 ? true : false"
        :key="tag"
        v-for="tag in tags"
        :tag="tag"
        @click="$emit('filterByTag', tag)"
      />
    </div>
  </div>
</template>

<style></style>
