<script lang="ts">
import { defineComponent, PropType, computed, ref, Ref } from "vue";
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
import { GET_DISCUSSIONS_WITH_DISCUSSION_CHANNEL_DATA } from "@/graphQLData/discussion/queries";
import { modProfileNameVar } from "@/cache";
import { getFilterValuesFromParams } from "@/components/event/list/filters/getFilterValuesFromParams";
import { SearchDiscussionValues } from "../../../types/discussionTypes";
import getDiscussionWhere from "@/components/discussion/list/getDiscussionWhere";
import { useDisplay } from "vuetify";
import { DiscussionWhere } from "@/__generated__/graphql";

const DISCUSSION_PAGE_LIMIT = 25;

export default defineComponent({
  components: {
    ChannelDiscussionListItem,
    ErrorBanner,
    LoadMore,
    WarningModal,
  },
  inheritAttrs: false,
  props: {
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
  // The reason we have separate components for the sidewide discussion
  // list and the channel discussion list is because the channel discussion
  // list needs the query to get discussions to return more information,
  // specifically the comment section data, which is needed to display
  // the vote buttons.
  // The channel list fetches the DiscussionChannel nodes, which contain
  // comments and votes that are attached to the discussion's submission to a specific
  // channel. In contrast, the sitewide list fetches Discussion resources directly.
  setup() {
    const router = useRouter();
    const route = useRoute();

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    const filterValues: Ref<SearchDiscussionValues> = ref(
      getFilterValuesFromParams({
        route,
        channelId: channelId.value,
      }),
    );

    const discussionWhere = computed<DiscussionWhere>(() => {
      return getDiscussionWhere(filterValues.value, channelId.value);
    });

    const discussionChannelWhere = computed(() => {
      return {
        channelUniqueName: channelId.value,
        Discussion: discussionWhere.value,
      };
    });

    const {
      result: discussionChannelResult,
      error: discussionError,
      loading: discussionLoading,
      refetch: refetchDiscussions,
      onResult: onGetDiscussionResult,
      fetchMore,
    } = useQuery(GET_DISCUSSIONS_WITH_DISCUSSION_CHANNEL_DATA, {
      where: discussionChannelWhere,
      limit: DISCUSSION_PAGE_LIMIT,
      offset: 0,
      resultsOrder: {
        upvoteCount: "DESC",
      },
    });

    const reachedEndOfResults = ref(false);

    const loadMore = () => {
      fetchMore({
        variables: {
          offset: discussionChannelResult.value.discussionChannels.length,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult;

          return {
            discussionChannelsAggregate:
              fetchMoreResult.discussionChannelsAggregate,
            discussionChannels: [
              ...previousResult.discussionChannels,
              ...fetchMoreResult.discussionChannels,
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
      if (!value.data || value.data.discussionChannels.length === 0) {
        return;
      }
      const defaultSelectedDiscussionChannel = value.data.discussionChannels[0];

      sendToPreview(defaultSelectedDiscussionChannel.discussionId);
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
    const { mdAndDown } = useDisplay();

    return {
      createModProfile,
      discussionError,
      discussionLoading,
      discussionChannelResult,
      filterValues,
      loadMore,
      mdAndDown,
      reachedEndOfResults,
      refetchDiscussions,
      sendToPreview,
      selectedDiscussion: {} as DiscussionData,
      showModProfileModal: ref(false),
    };
  },
  created() {
    this.$watch("$route.query", () => {
      if (this.$route.query) {
        this.filterValues = getFilterValuesFromParams({
          route: this.$route,
          channelId: this.channelId,
        });
      }
    });
    if (
      !this.discussionId &&
      this.discussionResult &&
      this.discussionResult.discussions &&
      this.discussionResult.discussions.length > 0
    ) {
      this.sendToPreview(
        this.discussionResult.discussionChannels[0].discussionId,
      );
    }
  },
  methods: {
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
});
</script>
<template>
  <div class="w-full">
    <p v-if="discussionLoading">
      Loading...
    </p>
    <ErrorBanner
      v-else-if="discussionError"
      class="max-w-5xl"
      :text="discussionError.message"
    />
    <p
      v-else-if="
        discussionChannelResult &&
          discussionChannelResult.discussionChannels.length === 0
      "
      class="my-6 px-4"
    >
      There are no results.
    </p>
    <div v-else>
      <div>
        <ul
          role="list"
          class="relative my-2 rounded"
          data-testid="channel-discussion-list"
        >
          <ChannelDiscussionListItem
            v-for="discussionChannel in discussionChannelResult.discussionChannels"
            :key="discussionChannel.id"
            :discussion="discussionChannel.Discussion"
            :discussion-channel="discussionChannel"
            :search-input="searchInput"
            :selected-tags="selectedTags"
            :selected-channels="selectedChannels"
            @openModProfile="showModProfileModal = true"
            @filterByTag="filterByTag"
            @filterByChannel="filterByChannel"
          />
        </ul>
        <div v-if="discussionChannelResult.discussionChannels.length > 0">
          <LoadMore
            class="justify-self-center"
            :reached-end-of-results="
              discussionChannelResult.discussionChannelsAggregate?.count ===
                discussionChannelResult.discussionChannels.length
            "
            @loadMore="loadMore"
          />
        </div>
      </div>
    </div>
    <WarningModal
      :title="'Create Mod Profile'"
      :body="`Moderation activity is tracked to prevent abuse, therefore you need to create a mod profile in order to downvote this comment. Continue?`"
      :open="showModProfileModal"
      :primary-button-text="'Yes, create a mod profile'"
      @close="showModProfileModal = false"
      @primaryButtonClick="handleCreateModProfileClick"
    />
  </div>
</template>
