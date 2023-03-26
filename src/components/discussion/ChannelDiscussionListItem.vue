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
import { GET_DISCUSSION } from "@/graphQLData/discussion/queries";
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
import { useAuth0 } from "@auth0/auth0-vue";
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
    const { isAuthenticated, error, isLoading } = useAuth0();
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

    if (localModProfileNameError){
      console.log("error getting local mod profile name", localModProfileNameError)
    }

    const loggedInUserModName = computed(() => {
      if (
        isLoading ||
        error ||
        !isAuthenticated
      ) {
        return "";
      }
      console.log("found mod name ", localModProfileNameResult.value)
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

        update: (cache: any, result: any) => {
          console.log("result - create comment section complete", result);
          cache.modify({
            fields: {
              discussions() {
                const readQueryResult = cache.readQuery({
                  query: GET_DISCUSSION,
                  variables: {
                    id: discussionIdInParams.value,
                  },
                });
                if (readQueryResult) {
                  const existingDiscussion = readQueryResult.discussions[0];
                  const newCommentSection =
                    result.data?.createCommentSections?.commentSections[0];
                  cache.writeQuery({
                    query: GET_DISCUSSION,
                    data: {
                      discussions: [
                        {
                          ...existingDiscussion,
                          CommentSections: [
                            ...existingDiscussion.CommentSections,
                            newCommentSection,
                          ],
                        },
                      ],
                    },
                    variables: {
                      id: discussionIdInParams.value,
                    },
                  });
                }
              },
            },
          });
        },
      }));

    const loggedInUserUpvoted = computed(() => {
      if (
        localUsernameLoading.value ||
        !localUsernameResult.value ||
        !props.commentSection.UpvotedByUsers
      ) {
        return false;
      }
      const match =
        props.commentSection.UpvotedByUsers.filter((user: any) => {
          return user.username === localUsernameResult.value.username;
        }).length === 1;
      return match;
    });

    const loggedInUserDownvoted = computed(() => {
      if (
        localModProfileNameLoading.value ||
        !localModProfileNameResult.value ||
        !props.commentSection.DownvotedByModerators
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

    console.log({
      discussionUpvotes: props.discussion.UpvotedByUsersAggregate?.count,
      discussionDownvotes:
        props.discussion.DownvotedByModeratorsAggregate?.count,
      commentSectionUpvotes: props.discussion.CommentSections[0]
        ? props.discussion.CommentSections[0].UpvotedByUsersAggregate?.count
        : 0,
      commentSectionDownvotes: props.discussion.CommentSections[0]
        ? props.discussion.CommentSections[0].DownvotedByModeratorsAggregate
            ?.count
        : 0,
    });

    console.log({
      discussion: props.discussion,
      commentSection: props.commentSection,
    });

    return {
      createCommentSection,
      createCommentSectionError,
      defaultUniqueName, //props.discussion.CommentSectionSections[0].Channel.uniqueName,
      discussionIdInParams,
      loggedInUserUpvoted,
      loggedInUserDownvoted,
      loggedInUserModName,
      upvoteCommentSection,
      downvoteCommentSection,
      undoUpvoteCommentSection,
      undoDownvoteCommentSection,
      upvoteDiscussion,
      downvoteDiscussion,
      undoUpvoteDiscussion,
      undoDownvoteDiscussion,
      upvoteCommentSectionError,
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
      previewIsOpen: false,
      title: props.discussion.title,
      body: props.discussion.body || "",
      createdAt: props.discussion.createdAt,
      relativeTime: relativeTime(props.discussion.createdAt),
      authorUsername: props.discussion.Author
        ? props.discussion.Author.username
        : "Deleted",
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
      console.log("clicked upvote");
      if (this.loggedInUserUpvoted) {
        console.log("undoing upvote");
        this.undoUpvote();
      } else {
        console.log("upvoting");
        this.upvote();
      }
    },
    handleClickDown() {
      console.log("clicked downvote");
      console.log("this.loggedInUserModName", this.loggedInUserModName)
      if (this.loggedInUserModName) {
        if (!this.loggedInUserDownvoted) {
          this.$emit("downvote");

          this.downvote()
        } else {
          this.$emit("undoDownvote");
          this.undoDownvote();
        }
      } else {
        // Create mod profile, then downvote comment
        this.$emit("openModProfile");
      }
    },
    createCommentSectionIfNoneExists() {
      console.log("createCommentSectionIfNoneExists");
      if (this.discussion.CommentSections.length > 0) {
        console.log("commentSection exists");
        return;
      }
      console.log("commentSection does not exist");
      this.createCommentSection();
    },
    downvote() {
      console.log("downvote ran");
      // Note: Voting in the sitewide discussion page is not allowed.
      // We only collect the sitewide votes for ranking purposes. It basically
      // shows the sum of all votes in all channels.

      this.downvoteDiscussion(); // counts toward sitewide ranking
      this.createCommentSectionIfNoneExists();
      this.downvoteCommentSection(); // counts toward ranking within channel
    },
    upvote() {
      console.log("upvote ran");
      this.upvoteDiscussion(); // counts toward sitewide ranking
      this.createCommentSectionIfNoneExists();
      this.upvoteCommentSection(); // counts toward ranking within channel
    },
    undoUpvote() {
      console.log("undo upvote ran");
      this.undoUpvoteDiscussion(); // counts toward sitewide ranking
      this.createCommentSectionIfNoneExists();
      this.undoUpvoteCommentSection(); // counts toward ranking within channel
    },
    undoDownvote() {
      console.log("undo downvote ran");
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
      :downvote-count="
        commentSection.DownvotedByModeratorsAggregate?.count || 0
      "
      :upvote-count="commentSection.UpvotedByUsersAggregate?.count || 0"
      :upvote-active="loggedInUserUpvoted"
      :downvote-active="loggedInUserDownvoted"
      :has-mod-profile="!!loggedInUserModName"
      @clickUp="handleClickUp"
      @clickDown="handleClickDown"
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
