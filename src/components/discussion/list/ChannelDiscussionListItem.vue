<script lang="ts">
import { defineComponent, PropType, computed, ref } from "vue";
import { DiscussionData } from "../../../types/discussionTypes";
import { DiscussionChannelData } from "../../../types/commentTypes";
import { relativeTime } from "../../../dateTimeUtils";
import { useRoute } from "vue-router";
import Tag from "@/components/tag/Tag.vue";
import HighlightedSearchTerms from "@/components/generic/HighlightedSearchTerms.vue";
import {
  GET_LOCAL_MOD_PROFILE_NAME,
  GET_LOCAL_USERNAME,
} from "@/graphQLData/user/queries";
import { CREATE_DISCUSSION_CHANNEL } from "@/graphQLData/comment/mutations";
import { useQuery, useMutation } from "@vue/apollo-composable";
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
      type: Object as PropType<DiscussionChannelData>,
      required: false,
      default: () => {
        return {
          id: "",
          DiscussionId: "",
          ChannelId: "",
          Channel: {
            uniqueName: "",
          },
        };
      },
    },
    discussion: {
      type: Object as PropType<DiscussionData>,
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
      return props.discussion.Channels[0].uniqueName;
    });

    const { result: localUsernameResult, loading: localUsernameLoading } =
      useQuery(GET_LOCAL_USERNAME);

    const {
      result: localModProfileNameResult,
      loading: localModProfileNameLoading,
      error: localModProfileNameError,
    } = useQuery(GET_LOCAL_MOD_PROFILE_NAME);

    const username = computed(() => {
      if (localUsernameLoading.value) {
        return "";
      }
      return localUsernameResult.value?.username || "";
    });

    const loggedInUserModName = computed(() => {
      if (localModProfileNameLoading.value || localModProfileNameError.value) {
        return "";
      }
      return localModProfileNameResult.value.modProfileName;
    });

    const discussionChannelId = computed(() => {
      return props.discussionChannel?.id || "";
    });

    const {
      mutate: createDiscussionChannel,
      error: createDiscussionChannelError,
    } = useMutation(CREATE_DISCUSSION_CHANNEL, () => ({
      errorPolicy: "all",
      variables: {
        createDiscussionChannelInput: [
          {
            Discussion: {
              connect: {
                where: {
                  node: {
                    id: discussionIdInParams.value,
                  },
                },
              },
            },
            Channel: {
              connect: {
                where: { node: { uniqueName: channelIdInParams.value } },
              },
            },
          },
        ],
      },
    }));

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

    const loggedInUserDownvoted = computed(() => {
      if (
        localUsernameLoading.value ||
        !localUsernameResult.value ||
        !discussionChannelId.value
      ) {
        return false;
      }
      const mods = props.discussionChannel.DownvotedByModerators || [];
      const loggedInMod = localModProfileNameResult.value.modProfileName;
      const match =
        mods.filter((mod: any) => {
          return mod.displayName === loggedInMod;
        }).length === 1;
      return match;
    });

    const downvoteCount = computed(() => {
      if (props.discussion.DiscussionChannels[0]) {
        return props.discussion.DiscussionChannels[0]
          .DownvotedByModeratorsAggregate?.count;
      }
      return 0;
    });

    const upvoteCount = computed(() => {
      if (props.discussion.DiscussionChannels[0]) {
        return props.discussion.DiscussionChannels[0].UpvotedByUsersAggregate
          ?.count;
      }
      return 0;
    });

    const { lgAndUp } = useDisplay();

    return {
      discussionChannelId,
      createDiscussionChannel,
      createDiscussionChannelError,
      defaultUniqueName,
      discussionIdInParams,
      downvoteCount,
      lgAndUp,
      errorMessage: ref(""),
      isActive: computed(
        () => discussionIdInParams.value === props.discussion.id,
      ),
      loggedInUserUpvoted,
      loggedInUserDownvoted,
      loggedInUserModName,
      upvoteCount,
      username,
      route,
    };
  },
  data(props) {
    return {
      authorUsername: props.discussion.Author
        ? props.discussion.Author.username
        : "Deleted",
      previewIsOpen: false,
      title: props.discussion.title,
      body: props.discussion.body || "",
      createdAt: props.discussion.createdAt,
      relativeTime: relativeTime(props.discussion.createdAt),
      tags: props.discussion.Tags.map((tag) => {
        return tag.text;
      }),
    };
  },
  computed: {
    detailLink() {
      if (!this.discussion) {
        return "";
      }

      if (this.lgAndUp) {
        return `/channels/c/${this.defaultUniqueName}/discussions/search/${this.discussion.id}`;
      }

      return `/channels/c/${this.defaultUniqueName}/discussions/d/${this.discussion.id}`;
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
    <div class="flex w-full gap-3">
      <DiscussionVotes
        :discussion="discussion"
        :comment-section="discussion.DiscussionChannels[0]"
        :show-downvote="false"
      />
      <div
        class="flex h-10 w-10 items-center justify-center rounded bg-gray-100 dark:bg-gray-800"
      >
        <div>💬</div>
      </div>

      <div>
        <router-link :to="detailLink" class="hover:text-gray-500">
          <p class="cursor-pointer text-sm font-bold">
            <HighlightedSearchTerms :text="title" :search-input="searchInput" />
          </p>
        </router-link>
        <p class="font-medium my-1 text-xs text-slate-600 hover:no-underline">
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
    <ErrorBanner v-if="errorMessage" :text="errorMessage" />
  </li>
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>
