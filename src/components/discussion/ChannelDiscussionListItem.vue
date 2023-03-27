<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { DiscussionData } from "../../types/discussionTypes";
import { CommentSectionData } from "../../types/commentTypes";
import { relativeTime } from "../../dateTimeUtils";
import { useRoute } from "vue-router";
import VoteButtons from "./VoteButtons.vue";
import Tag from "@/components/tag/Tag.vue";
import HighlightedSearchTerms from "@/components/generic/HighlightedSearchTerms.vue";
import {
  GET_LOCAL_MOD_PROFILE_NAME,
  GET_LOCAL_USERNAME,
} from "@/graphQLData/user/queries";
import { CREATE_COMMENT_SECTION } from "@/graphQLData/comment/mutations";
import { useQuery, useMutation } from "@vue/apollo-composable";
import {
  DOWNVOTE_DISCUSSION,
  UPVOTE_DISCUSSION,
  UNDO_UPVOTE_DISCUSSION,
  UNDO_DOWNVOTE_DISCUSSION,
  DOWNVOTE_COMMENT_SECTION,
  UPVOTE_COMMENT_SECTION,
  UNDO_UPVOTE_COMMENT_SECTION,
  UNDO_DOWNVOTE_COMMENT_SECTION,
} from "@/graphQLData/discussion/mutations";
import ErrorBanner from "../generic/ErrorBanner.vue";

export default defineComponent({
  props: {
    commentSection: {
      type: Object as PropType<CommentSectionData>,
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
    VoteButtons,
    Tag,
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

    const loggedInUserModName = computed(() => {
      if (localModProfileNameLoading.value || localModProfileNameError.value) {
        return "";
      }
      return localModProfileNameResult.value.modProfileName;
    });

    const { mutate: downvoteDiscussion, error: downvoteDiscussionError } =
      useMutation(DOWNVOTE_DISCUSSION, () => ({
        variables: {
          id: props.discussion.id,
          displayName: loggedInUserModName.value,
        },
      }));

    const { mutate: upvoteDiscussion, error: upvoteDiscussionError } =
      useMutation(UPVOTE_DISCUSSION, () => ({
        variables: {
          id: props.discussion.id,
          username: localUsernameResult.value?.username || "",
        },
      }));

    const { mutate: undoUpvoteDiscussion, error: undoUpvoteDiscussionError } =
      useMutation(UNDO_UPVOTE_DISCUSSION, () => ({
        variables: {
          id: props.discussion.id,
          username: localUsernameResult.value?.username || "",
        },
      }));

    const {
      mutate: undoDownvoteDiscussion,
      error: undoDownvoteDiscussionError,
    } = useMutation(UNDO_DOWNVOTE_DISCUSSION, () => ({
      variables: {
        id: props.discussion.id,
        displayName: localModProfileNameResult.value?.modProfileName || "",
      },
    }));

    const {
      mutate: downvoteCommentSection,
      error: downvoteCommentSectionError,
    } = useMutation(DOWNVOTE_COMMENT_SECTION, () => ({
      variables: {
        id: props.commentSection.id,
        displayName: loggedInUserModName.value,
      },
    }));

    const { mutate: upvoteCommentSection, error: upvoteCommentSectionError } =
      useMutation(UPVOTE_COMMENT_SECTION, () => ({
        variables: {
          id: props.commentSection.id,
          username: localUsernameResult.value?.username || "",
        },
      }));

    const {
      mutate: undoUpvoteCommentSection,
      error: undoUpvoteCommentSectionError,
    } = useMutation(UNDO_UPVOTE_COMMENT_SECTION, () => ({
      variables: {
        id: props.commentSection.id,
        username: localUsernameResult.value?.username || "",
      },
    }));

    const {
      mutate: undoDownvoteCommentSection,
      error: undoDownvoteCommentSectionError,
    } = useMutation(UNDO_DOWNVOTE_COMMENT_SECTION, () => ({
      variables: {
        id: props.commentSection.id,
        displayName: localModProfileNameResult.value?.modProfileName || "",
      },
    }));

    const { mutate: createCommentSection, error: createCommentSectionError } =
      useMutation(CREATE_COMMENT_SECTION, () => ({
        errorPolicy: "all",
        variables: {
          createCommentSectionInput: [
            {
              OriginalPost: {
                Discussion: {
                  connect: {
                    where: {
                      node: {
                        id: discussionIdInParams.value,
                      },
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
        !props.discussion.CommentSections[0]
      ) {
        return false;
      }
      const match =
        props.discussion.CommentSections[0].UpvotedByUsers.filter(
          (user: any) => {
            return user.username === localUsernameResult.value.username;
          }
        ).length === 1;
      return match;
    });
    const loggedInUserDownvoted = computed(() => {
      if (
        localUsernameLoading.value ||
        !localUsernameResult.value ||
        !props.discussion.CommentSections[0]
      ) {
        return false;
      }
      const mods = props.commentSection.DownvotedByModerators;
      const loggedInMod = localModProfileNameResult.value.modProfileName;
      const match =
        mods.filter((mod: any) => {
          return mod.displayName === loggedInMod;
        }).length === 1;
      return match;
    });

    // const getDownvoteCount = () => {
    //   if (props.discussion.CommentSections[0]) {
    //     return props.discussion.CommentSections[0]
    //       .DownvotedByModeratorsAggregate?.count;
    //   }
    //   return 0;
    // };

    const downvoteCount = computed(() => {
      if (props.discussion.CommentSections[0]) {
        return props.discussion.CommentSections[0]
          .DownvotedByModeratorsAggregate?.count;
      }
      return 0;
    });

    // const getUpvoteCount = () => {
    //   if (props.discussion.CommentSections[0]) {
    //     return props.discussion.CommentSections[0].UpvotedByUsersAggregate
    //       ?.count;
    //   }
    //   return 0;
    // };

    const upvoteCount = computed(() => {
      if (props.discussion.CommentSections[0]) {
        return props.discussion.CommentSections[0].UpvotedByUsersAggregate
          ?.count;
      }
      return 0;
    });

    return {
      createCommentSection,
      createCommentSectionError,
      defaultUniqueName, //props.discussion.CommentSectionSections[0].Channel.uniqueName,
      discussionIdInParams,
      downvoteCount,
      // getDownvoteCount,
      loggedInUserUpvoted,
      loggedInUserDownvoted,
      loggedInUserModName,
      upvoteCommentSection,
      // getUpvoteCount,
      downvoteCommentSection,
      undoUpvoteCommentSection,
      undoDownvoteCommentSection,
      upvoteDiscussion,
      downvoteDiscussion,
      undoUpvoteDiscussion,
      undoDownvoteDiscussion,
      upvoteCommentSectionError,
      upvoteCount,
      undoUpvoteCommentSectionError,
      downvoteCommentSectionError,
      undoDownvoteCommentSectionError,
      upvoteDiscussionError,
      downvoteDiscussionError,
      undoUpvoteDiscussionError,
      undoDownvoteDiscussionError,
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
      // downvoteCount: this.getDownvoteCount(),
      relativeTime: relativeTime(props.discussion.createdAt),
      // upvoteCount: this.getUpvoteCount(),
      tags: props.discussion.Tags.map((tag) => {
        return tag.text;
      }),
    };
  },
  computed: {
    previewLink() {
      if (!this.discussion) {
        return "";
      }

      return `/channels/c/${this.defaultUniqueName}/discussions/search/${this.discussion.id}`;
    },
  },
  inheritAttrs: false,
  methods: {
    handleClickUp() {
      if (this.loggedInUserUpvoted) {
        this.undoUpvote();
      } else {
        this.upvote();
      }
    },
    handleClickDown() {
      if (this.loggedInUserModName) {
        if (!this.loggedInUserDownvoted) {
          this.downvote();
        } else {
          this.undoDownvote();
        }
      } else {
        // Create mod profile, then downvote comment
        // this.openModProfile()
      }
    },
    createCommentSectionIfNoneExists() {
      if (this.discussion.CommentSections.length > 0) {
        return;
      }
      this.createCommentSection();
    },
    downvote() {
      // Note: Voting in the sitewide discussion page is not allowed.
      // We only collect the sitewide votes for ranking purposes. It basically
      // shows the sum of all votes in all channels.
      this.downvoteDiscussion(); // counts toward sitewide ranking
      this.createCommentSectionIfNoneExists();
      this.downvoteCommentSection(); // counts toward ranking within channel
    },
    upvote() {
      this.upvoteDiscussion(); // counts toward sitewide ranking
      this.createCommentSectionIfNoneExists();
      this.upvoteCommentSection(); // counts toward ranking within channel
    },
    undoUpvote() {
      this.undoUpvoteDiscussion(); // counts toward sitewide ranking
      this.createCommentSectionIfNoneExists();
      this.undoUpvoteCommentSection(); // counts toward ranking within channel
    },
    undoDownvote() {
      this.undoDownvoteDiscussion(); // counts toward sitewide ranking
      this.createCommentSectionIfNoneExists();
      this.undoDownvoteCommentSection(); // counts toward ranking within channel
    },
  },
});
</script>

<template>
  <li
    :class="[
      discussion.id === discussionIdInParams
        ? 'border-blue-500'
        : 'border-blue-200',
    ]"
    class="hover:border-blue-500 border-l-4 relative bg-white py-2 px-4 space-x-2 cursor-pointer flex"
    @click="$emit('openPreview')"
  >
    <VoteButtons
      :downvote-count="downvoteCount"
      :upvote-count="upvoteCount"
      :upvote-active="loggedInUserUpvoted"
      :downvote-active="loggedInUserDownvoted"
      :has-mod-profile="!!loggedInUserModName"
      @downvote="downvote"
      @upvote="upvote"
      @openModProfile="$emit('openModProfile')"
      @undoUpvote="undoUpvote"
      @undoDownvote="undoDownvote"
    />
    <router-link :to="previewLink">
      <p class="text-lg font-bold cursor-pointer">
        <HighlightedSearchTerms :text="title" :search-input="searchInput" />
      </p>

      <p class="text-sm text-slate-600 hover:no-underline font-medium mt-1">
        <Tag
          class="my-1"
          :active="selectedTags.includes(tag)"
          :key="tag"
          v-for="tag in tags"
          :tag="tag"
          @click="$emit('filterByTag', tag)"
        />
      </p>
      <p class="text-xs font-medium text-slate-600 no-underline">
        {{ `Posted ${relativeTime} by ${authorUsername}` }}
      </p>
    </router-link>
    <ErrorBanner
      v-if="upvoteCommentSectionError"
      :text="upvoteCommentSectionError.message"
    />
    <ErrorBanner
      v-if="undoUpvoteCommentSectionError"
      :text="undoUpvoteCommentSectionError.message"
    />
    <ErrorBanner
      v-if="downvoteCommentSectionError"
      :text="downvoteCommentSectionError.message"
    />
    <ErrorBanner
      v-if="undoDownvoteCommentSectionError"
      :text="undoDownvoteCommentSectionError.message"
    />
    <ErrorBanner
      v-if="upvoteDiscussionError"
      :text="upvoteDiscussionError.message"
    />
    <ErrorBanner
      v-if="downvoteDiscussionError"
      :text="downvoteDiscussionError.message"
    />
    <ErrorBanner
      v-if="undoUpvoteDiscussionError"
      :text="undoUpvoteDiscussionError.message"
    />
    <ErrorBanner
      v-if="undoDownvoteDiscussionError"
      :text="undoDownvoteDiscussionError.message"
    />
  </li>
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>
