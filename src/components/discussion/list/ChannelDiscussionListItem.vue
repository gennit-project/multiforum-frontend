<script lang="ts">
import { defineComponent, PropType, computed, ref } from "vue";
import { Discussion, DiscussionChannel } from "@/__generated__/graphql";
import { relativeTime } from "../../../dateTimeUtils";
import { useRoute } from "vue-router";
import Tag from "@/components/tag/Tag.vue";
import HighlightedSearchTerms from "@/components/generic/HighlightedSearchTerms.vue";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { useQuery } from "@vue/apollo-composable";
import ErrorBanner from "../../generic/ErrorBanner.vue";
import { useDisplay } from "vuetify";
import DiscussionVotes from "../vote/DiscussionVotes.vue";
import UsernameWithTooltip from "@/components/generic/UsernameWithTooltip.vue";
import { timeAgo } from "@/dateTimeUtils";
import MarkdownPreview from "@/components/generic/forms/MarkdownPreview.vue";

export default defineComponent({
  components: {
    ErrorBanner,
    HighlightedSearchTerms,
    Tag,
    DiscussionVotes,
    UsernameWithTooltip,
    MarkdownPreview,
  },
  inheritAttrs: false,
  props: {
    discussionQueryFilters: {
      type: Object as PropType<object>,
      default: () => {
        return {};
      },
    },
    discussionChannel: {
      type: Object as PropType<DiscussionChannel>,
      required: true,
    },
    discussion: {
      type: Object as PropType<Discussion | null>,
      required: false,
      default: null,
    },
    searchInput: {
      type: String,
      default: "",
    },
    selectedTags: {
      type: Array as PropType<Array<string>>,
      default: () => {
        return [];
      },
    },
    selectedChannels: {
      type: Array as PropType<Array<string>>,
      default: () => {
        return [];
      },
    },
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
        return props.discussionChannel.UpvotedByUsersAggregate?.count || 0;
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

    const truncatedBody = computed(() => {
      if (!props.discussion) {
        return "";
      }

      if (props.discussion?.body && props.discussion.body.length > 200) {
        return props.discussion?.body.slice(0, 500) + "...";
      }
      return props.discussion.body;
    });

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
      timeAgo,
      truncatedBody,
    };
  },
  data(props) {
    return {
      authorUsername: props.discussion?.Author
        ? props.discussion.Author.username
        : "Deleted",
      authorCommentKarma: props.discussion?.Author
        ? props.discussion.Author.commentKarma
        : 0,
      authorDiscussionKarma: props.discussion?.Author
        ? props.discussion.Author.discussionKarma
        : 0,
      authorAccountCreated: props.discussion?.Author
        ? props.discussion.Author.createdAt
        : "",
      previewIsOpen: false,
      title: props.discussion?.title || "[Deleted]",
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
      if (!this.discussion) {
        return "";
      }
      // Base URL for lgAndUp and other screen sizes
      let baseLink = "";

      baseLink = `/channels/c/${this.defaultUniqueName}/discussions/d/${this.discussionChannel.discussionId}`;

      return baseLink;
    },
    filteredQuery() {
      const query = { ...this.$route.query };
      for (let key in query) {
        if (!query[key]) {
          delete query[key];
        }
      }
      return query;
    },
  },
});
</script>

<template>
  <li
    class="relative mt-1 flex space-y-3 border-b border-gray-200 py-4 dark:border-gray-500 lg:py-4"
  >
    <v-row>
      <v-col :cols="2">
        <DiscussionVotes
          v-if="discussionChannel"
          :discussion="discussion"
          :discussion-channel="discussionChannel"
          :show-downvote="false"
        />
      </v-col>
      <v-col :cols="10">
        <div class="flex-col gap-2">
          <router-link
            :to="{ path: detailLink, query: filteredQuery }"
            class="hover:text-gray-500"
          >
            <p
              class="text-md cursor-pointer font-bold hover:text-gray-500 dark:text-gray-100"
            >
              <HighlightedSearchTerms
                :text="title"
                :search-input="searchInput"
              />
            </p>
          </router-link>

          <div
            v-if="truncatedBody"
            class="my-2 border-l-2 border-gray-400 dark:bg-gray-700"
          >
            <router-link :to="{ path: detailLink, query: filteredQuery }">
              <MarkdownPreview
                :text="truncatedBody || ''"
                :disable-gallery="true"
                class="-ml-4"
              />
            </router-link>
          </div>

          <div
            class="font-medium my-1 flex space-x-1 text-xs text-gray-600 hover:no-underline"
          >
            <Tag
              v-for="tag in tags"
              :key="tag"
              class="my-1"
              :active="selectedTags.includes(tag)"
              :tag="tag"
              @click="$emit('filterByTag', tag)"
            />
          </div>
          <p
            class="font-medium text-xs text-gray-600 no-underline dark:text-gray-300"
          >
            <span class="mr-1"> {{ `Posted ${relativeTime} by` }}</span>

            <UsernameWithTooltip
              v-if="authorUsername"
              :username="authorUsername"
              :comment-karma="authorCommentKarma ?? 0"
              :discussion-karma="authorDiscussionKarma ?? 0"
              :account-created="authorAccountCreated"
            />
          </p>

          <div class="mt-2 flex items-center justify-start gap-6">
            <router-link :to="{ path: detailLink, query: filteredQuery }">
              <i class="fa-regular fa-comment h-6 w-6" />
              <span class="text-sm">{{
                `${commentCount} comment${commentCount === 1 ? "" : "s"}`
              }}</span>
            </router-link>
          </div>
        </div>
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
