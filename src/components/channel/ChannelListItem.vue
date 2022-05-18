<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ChannelData } from "@/types/channelTypes";
import HighlightedSearchTerms from "../forms/HighlightedSearchTerms.vue";
import Tag from "../buttons/Tag.vue";
// @ts-ignore
import ProfileAvatar from 'vue-profile-avatar'

export default defineComponent({
  setup() {
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
    ProfileAvatar,
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
          <ProfileAvatar
      :username="channel.uniqueName"
      colorType="pastel"
    ></ProfileAvatar>
    </div>
    <div class="flex-1 min-w-0">
      <p class="font-large text-gray-900">
        <router-link
          :to="`/channels/${channel.uniqueName}`"
          class="focus:outline-none cursor-pointer"
        >
          <HighlightedSearchTerms
            :text="channel.uniqueName"
            :search-input="searchInput"
          />
        </router-link>
      </p>
      <p v-if="channel.description" class="text-sm truncate">
        <HighlightedSearchTerms
          :text="channel.description"
          :search-input="searchInput"
        />
      </p>
      <p class="text-sm truncate">
        <router-link
          class="underline"
          :to="`/channels/${channel.uniqueName}/discussions`"
          >{{ channel.DiscussionsAggregate.count }} Discussions</router-link
        >,

        <router-link
          class="underline"
          :to="`/channels/${channel.uniqueName}/events`"
        >
          {{ channel.EventsAggregate.count }} Events</router-link
        >
      </p>
      <Tag
        :highlighted-tags="selectedTags"
        :key="tag"
        v-for="tag in tags"
        :tag="tag"
        @click="$emit('filterByTag', tag)"
      />
    </div>
  </div>
</template>

<style></style>
