<script lang="ts">
import { defineComponent, PropType, computed, ref } from "vue";
import ChannelDiscussionListItem from "./ChannelDiscussionListItem.vue";
import LoadMore from "../../generic/LoadMore.vue";
import ErrorBanner from "../../generic/ErrorBanner.vue";
import { DiscussionData } from "../../../types/discussionTypes";
import { useRoute, useRouter } from "vue-router";
import WarningModal from "../../generic/WarningModal.vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { generateSlug } from "random-word-slugs";
import { CREATE_MOD_PROFILE } from "@/graphQLData/user/mutations";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { GET_DISCUSSIONS_WITH_COMMENT_SECTION_DATA } from "@/graphQLData/discussion/queries";
import { modProfileNameVar } from "@/cache";


const DISCUSSION_PAGE_LIMIT = 25;

export default defineComponent({
  // The reason we have separate components for the sidewide discussion
  // list and the channel discussion list is because the channel discussion
  // list needs the query to get discussions to return more information,
  // specifically the comment section data, which is needed to display
  // the vote buttons.
  setup(props) {
    const router = useRouter();
    const route = useRoute();

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    const discussionQueryFilters = computed(() => {
      // We pass the current filters as a prop
      // to the discussion list item so that the Apollo
      // cache be updated properly when the user
      // votes from the list view.
      return {
        where: props.discussionWhere,
        limit: DISCUSSION_PAGE_LIMIT,
        offset: 0,
        resultsOrder: {
          createdAt: "DESC",
        },
      };
    });

    const {
      result: discussionResult,
      error: discussionError,
      loading: discussionLoading,
      refetch: refetchDiscussions,
      onResult: onGetDiscussionResult,
      fetchMore,
    } = useQuery(
      GET_DISCUSSIONS_WITH_COMMENT_SECTION_DATA,
      {
        ...discussionQueryFilters.value,
      },
      {
        fetchPolicy: "network-only",
      }
    );

    const reachedEndOfResults = ref(false);

    const loadMore = () => {
      fetchMore({
        variables: {
          offset: discussionResult.value.discussions.length,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult;

          return {
            ...previousResult,
            discussions: [
              ...previousResult.discussions,
              ...fetchMoreResult.discussions,
            ],
          };
        },
      });
    };
    const sendToPreview = (discussionId: string) => {
      if (!route.params.discussionId) {
        if (!channelId.value) {
          router.push({
            name: "SitewideSearchDiscussionPreview",
            params: {
              discussionId: discussionId,
            },
          });
        } else {
          router.push({
            name: "SearchDiscussionPreview",
            params: {
              discussionId: discussionId,
            },
          });
        }
      }
    };

    onGetDiscussionResult((value) => {
      // If the preview pane is blank, fill it with the details
      // of the first result, if there is one.
      if (!value.data || value.data.discussions.length === 0) {
        return;
      }
      const defaultSelectedDiscussion = value.data.discussions[0];

      sendToPreview(defaultSelectedDiscussion.id);
    });

    const {
      result: localUsernameResult,
      loading: localUsernameLoading,
      error: localUsernameError,
    } = useQuery(GET_LOCAL_USERNAME);

    const username = computed(() => {
      if (localUsernameLoading.value || localUsernameError.value) {
        return "";
      }
      return localUsernameResult.value;
    });

    const randomWords = generateSlug(4, { format: "camel" });

    const { mutate: createModProfile, onDone: onDoneCreateModProfile } =
      useMutation(CREATE_MOD_PROFILE, () => ({
        variables: {
          displayName: randomWords,
          username: username.value?.username,
        },
      }));

    onDoneCreateModProfile(({ data }) => {
      const updatedUser = data.updateUsers.users[0];

      const newModProfileName = updatedUser.ModerationProfile.displayName;
      modProfileNameVar(newModProfileName);
    });
    
    return {
      createModProfile,
      discussionError,
      discussionLoading,
      discussionResult,
      discussionQueryFilters,
      loadMore,
      reachedEndOfResults,
      refetchDiscussions,
      selectedDiscussion: {} as DiscussionData,
      showModProfileModal: ref(false),
    };
  },
  props: {
    discussionWhere: {
      type: Object as PropType<Object>,
      default: () => {
        return {};
      },
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
  data() {
    return {
      previewIsOpen: false,
    };
  },
  components: {
    ChannelDiscussionListItem,
    ErrorBanner,
    LoadMore,
    WarningModal,
  },
  methods: {
    openPreview(data: DiscussionData) {
      this.previewIsOpen = true;
      this.selectedDiscussion = data;
      this.$emit("openPreview");
    },
    filterByTag(tag: string) {
      this.$emit("filterByTag", tag);
    },
    filterByChannel(channel: string) {
      this.$emit("filterByChannel", channel);
    },
    async handleCreateModProfileClick() {
      await this.createModProfile();
      modProfileNameVar();
      this.downvote();
      this.showModProfileModal = false;
      // show snack
    },
  },
  inheritAttrs: false,
});
</script>
<template>
  <div class="w-full h-full shadow-md">
    <p v-if="discussionLoading">Loading...</p>
    <ErrorBanner
      class="max-w-5xl"
      v-else-if="discussionError"
      :text="discussionError.message"
    />
    <p
      v-else-if="discussionResult && discussionResult.discussions.length === 0"
      class="px-4"
    >
      There are no results.
    </p>
    <div v-else>
      <p class="sm:px-4">
        Showing {{ discussionResult.discussions.length }} of
        {{ discussionResult.discussionsAggregate?.count }} results
      </p>
      <div class="h-full  ">
        <ul role="list" class="relative my-2  rounded border border-1">
          <ChannelDiscussionListItem
            v-for="discussion in discussionResult.discussions"
            :key="discussion.id"
            :discussion="discussion"
            :discussion-query-filters="discussionQueryFilters"
            :comment-section="discussion.CommentSections[0]"
            :search-input="searchInput"
            :selected-tags="selectedTags"
            :selected-channels="selectedChannels"
            @openModProfile="this.showModProfileModal = true"
            @filterByTag="filterByTag"
            @filterByChannel="filterByChannel"
            @openPreview="openPreview"
          />
        </ul>
        <div
          v-if="discussionResult.discussions.length > 0"
          class="px-4 lg:px-12"
        >
          <LoadMore
            class="justify-self-center"
            :reached-end-of-results="
              discussionResult.discussionsAggregate?.count === discussionResult.discussions.length
            "
            @loadMore="$emit('loadMore')"
          />
        </div>
      </div>
    </div>
    <WarningModal
      :title="'Create Mod Profile'"
      :body="`Moderation activity is tracked to prevent abuse, therefore you need to create a mod profile in order to downvote this comment. Continue?`"
      :open="showModProfileModal"
      :primaryButtonText="'Yes, create a mod profile'"
      @close="showModProfileModal = false"
      @primaryButtonClick="handleCreateModProfileClick"
    />
  </div>
</template>
