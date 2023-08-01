<script lang="ts">
import { defineComponent, PropType, computed, ref } from "vue";
import { DiscussionData } from "../../../types/discussionTypes";
import { DiscussionChannel } from "@/__generated__/graphql";
import { relativeTime } from "../../../dateTimeUtils";
import { useRoute } from "vue-router";
import Tag from "@/components/tag/Tag.vue";
import HighlightedSearchTerms from "@/components/generic/HighlightedSearchTerms.vue";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { useQuery } from "@vue/apollo-composable";
import ErrorBanner from "../../generic/ErrorBanner.vue";
import { useDisplay } from "vuetify";
import DiscussionVotes from "../vote/DiscussionVotes.vue";

export default defineComponent({
  props: {
    discussionQueryFilters: {
      type: Object as PropType<Object>,
      default: () => {
        return {};
      },
    },
    discussionChannel: {
      type: Object as PropType<DiscussionChannel>,
      required: true,
    },
    discussion: {
      type: Object as PropType<DiscussionData>,
      required: false,
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
    selectedChannels: {
      type: Array as PropType<Array<String>>,
      default: () => {
        return [];
      },
    },
  },
  components: {
    ErrorBanner,
    HighlightedSearchTerms,
    Tag,
    DiscussionVotes,
  },
  setup(props) {
    const route = useRoute();
    const channelIdInParams = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });
    const discussionIdInParams = computed(() => {
      if (typeof route.params.discussionId === "string") {
        return route.params.discussionId;
      }
      return "";
    });
    const defaultUniqueName = computed(() => {
      if (channelIdInParams.value) {
        return channelIdInParams.value;
      }
      return props.discussionChannel.channelUniqueName;
    });

    const { result: localUsernameResult, loading: localUsernameLoading } =
      useQuery(GET_LOCAL_USERNAME);

    const username = computed(() => {
      if (localUsernameLoading.value) {
        return "";
      }
      return localUsernameResult.value?.username || "";
    });

    const discussionChannelId = computed(() => {
      return props.discussionChannel?.id || "";
    });

    const loggedInUserUpvoted = computed(() => {
      if (
        localUsernameLoading.value ||
        !localUsernameResult.value ||
        !discussionChannelId.value
      ) {
        return false;
      }
      const users = props.discussionChannel.UpvotedByUsers || [];

      const loggedInUser = localUsernameResult.value.username;
      const match =
        users.filter((user: any) => {
          return user.username === loggedInUser;
        }).length === 1;
      return match;
    });

    const upvoteCount = computed(() => {
      if (props.discussionChannel) {
        return props.discussionChannel.upvoteCount;
      }
      return 0;
    });

    const commentCount = computed(() => {
      if (props.discussionChannel) {
        return props.discussionChannel.CommentsAggregate?.count || 0;
      }
      return 0;
    });

    const { lgAndUp } = useDisplay();

    return {
      commentCount,
      discussionChannelId,
      defaultUniqueName,
      discussionIdInParams,
      lgAndUp,
      errorMessage: ref(""),
      isActive: computed(
        () =>
          discussionIdInParams.value === props.discussionChannel.discussionId,
      ),
      loggedInUserUpvoted,
      upvoteCount,
      username,
      route,
    };
  },
  data(props) {
    return {
      authorUsername: props.discussion?.Author
        ? props.discussion.Author.username
        : "Deleted",
      previewIsOpen: false,
      title: props.discussion?.title || "[Deleted]",
      body: props.discussion?.body || "[Deleted]",
      createdAt: props.discussionChannel.createdAt,
      relativeTime: relativeTime(props.discussionChannel.createdAt),
      tags: props.discussion
        ? props.discussion.Tags.map((tag) => {
            return tag.text;
          })
        : [],
    };
  },
  computed: {
    detailLink() {
      if (this.lgAndUp) {
        return `/channels/c/${this.defaultUniqueName}/discussions/search/${this.discussionChannel.discussionId}`;
      }

      return `/channels/c/${this.defaultUniqueName}/discussions/d/${this.discussionChannel.discussionId}`;
    },
  },
  inheritAttrs: false,
});
</script>

<template>
  <li
    class="relative my-2 flex space-x-1 space-y-3 border-b py-2 dark:border-gray-800"
    :class="[isActive ? 'text-blue-500' : '']"
  >
    <v-row>
      <v-col cols="9">
        <div class="flex w-full gap-3">
          <DiscussionVotes
            v-if="discussionChannel"
            :discussion="discussion"
            :discussion-channel="discussionChannel"
            :show-downvote="false"
          />
          <div
            class="flex h-10 w-10 items-center justify-center rounded bg-gray-100 dark:bg-gray-800"
          >
            <div>💬</div>
          </div>
          <div>
            <router-link :to="detailLink" class="hover:text-gray-500">
              <p class="text-md cursor-pointer font-bold hover:text-gray-500">
                <HighlightedSearchTerms
                  :text="title"
                  :search-input="searchInput"
                />
              </p>
            </router-link>
            <p
              class="font-medium my-1 text-xs text-slate-600 hover:no-underline"
            >
              <Tag
                class="my-1"
                :active="selectedTags.includes(tag)"
                :key="tag"
                v-for="tag in tags"
                :tag="tag"
                @click="$emit('filterByTag', tag)"
              />
            </p>
            <p
              class="font-medium text-xs text-slate-600 no-underline dark:text-gray-300"
            >
              {{ `Posted ${relativeTime} by ${authorUsername}` }}
            </p>
          </div>
        </div>
      </v-col>
      <v-col cols="3">
        <i class="fa-regular fa-comment h-6 w-6"></i>
        {{ commentCount }}
      </v-col>

      <ErrorBanner v-if="errorMessage" :text="errorMessage" />
    </v-row>
  </li>
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>
