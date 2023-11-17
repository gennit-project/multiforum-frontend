<script lang="ts">
import { defineComponent, computed, PropType, ref } from "vue";
import { Discussion } from "@/__generated__/graphql";
import { useMutation, useQuery } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { relativeTime } from "@/dateTimeUtils";
import { DateTime } from "luxon";
import { DELETE_DISCUSSION } from "@/graphQLData/discussion/mutations";
import WarningModal from "../../generic/WarningModal.vue";
import ErrorBanner from "../../generic/ErrorBanner.vue";
import Avatar from "@/components/user/Avatar.vue";
import { useDisplay } from "vuetify";
import UsernameWithTooltip from "@/components/generic/UsernameWithTooltip.vue";
import MenuButton from "@/components/generic/buttons/MenuButton.vue";
import useClipboard from "vue-clipboard3";
import EllipsisHorizontal from "@/components/icons/EllipsisHorizontal.vue";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import Notification from "@/components/generic/Notification.vue";

export default defineComponent({
  components: {
    EllipsisHorizontal,
    ErrorBanner,
    MenuButton,
    WarningModal,
    Avatar,
    UsernameWithTooltip,
    Notification
  },
  props: {
    discussion: {
      type: Object as PropType<Discussion | null>,
      required: false,
      default: null,
    },
    compactMode: {
      type: Boolean,
      required: false,
      default: false,
    },
    channelId: {
      type: String,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();

    const editedAt = computed(() => {
      if (!props.discussion?.updatedAt) {
        return "";
      }
      return `Edited ${relativeTime(props.discussion.updatedAt)}`;
    });

    const createdAt = computed(() => {
      if (!props.discussion?.createdAt) {
        return "";
      }
      return `posted ${relativeTime(props.discussion?.createdAt)}`;
    });

    const {
      mutate: deleteDiscussion,
      error: deleteDiscussionError,
      onDone: onDoneDeleting,
    } = useMutation(DELETE_DISCUSSION, {
      variables: {
        id: props.discussion?.id,
      },
      update: (cache: any) => {
        cache.modify({
          fields: {
            discussions(existingDiscussionRefs = [], fieldInfo: any) {
              const readField = fieldInfo.readField;

              return existingDiscussionRefs.filter((ref) => {
                return readField("id", ref) !== props.discussion?.id;
              });
            },
          },
        });
      },
    });

    onDoneDeleting(() => {
      if (props.channelId) {
        router.push({
          name: "SearchDiscussionsInChannel",
          params: {
            channelId: props.channelId,
          },
        });
      }
    });

    const defaultChannel = computed(() => {
      if (!props.discussion) {
        return "";
      }
      const channelInRoute = route.params.channelId;

      if (channelInRoute) {
        return channelInRoute;
      }
      return props.discussion.DiscussionChannels[0].channelUniqueName;
    });

    const permalinkObject = computed(() => {
      if (!props.discussion) {
        return {};
      }
      return {
        name: "DiscussionDetail",
        params: {
          discussionId: props.discussion.id,
          channelId: defaultChannel.value,
        },
      };
    });

    const { toClipboard } = useClipboard();

    const showCopiedLinkNotification = ref(false);

    const copyLink = async (event: any) => {
      try {
        const basePath = window.location.origin;
        const permalink = `${basePath}${
          router.resolve(permalinkObject.value).href
        }`;
        await toClipboard(permalink);
        showCopiedLinkNotification.value = event
      } catch (e: any) {
        throw new Error(e);
      }
      setTimeout(() => {
        showCopiedLinkNotification.value = false;
      }, 2000);
    };

    const deleteModalIsOpen = ref(false);

    const { lgAndDown, lgAndUp, mdAndDown, mdAndUp, xlAndUp } = useDisplay();

    const {
      result: localUsernameResult,
      loading: localUsernameLoading,
      error: localUsernameError,
    } = useQuery(GET_LOCAL_USERNAME);

    const username = computed(() => {
      if (localUsernameLoading.value || localUsernameError.value) {
        return "";
      }
      return localUsernameResult.value.username;
    });

    const menuItems = computed(() => {
      const out = []
      if (props.discussion) {
        out.push({
          label: "Copy Link",
          value: "",
          event: "copyLink",
        });
      }

      if (props.discussion?.Author?.username === username.value) {
        out.push({
          label: "Edit",
          value: "",
          event: "handleEdit",
        });
        out.push({
          label: "Delete",
          value: "",
          event: "handleDelete",
        });
      }
      
      return out;
    });
 
    return {
      copyLink,
      createdAt,
      deleteModalIsOpen,
      deleteDiscussion,
      deleteDiscussionError,
      editedAt,
      menuItems,
      route,
      router,
      lgAndDown,
      lgAndUp,
      mdAndDown,
      mdAndUp,
      showCopiedLinkNotification,
      xlAndUp,
    };
  },
  methods: {
    getFormattedDateString(startTime: string) {
      const startTimeObj = DateTime.fromISO(startTime);

      return startTimeObj.toFormat("cccc LLLL d yyyy");
    },
  },
});
</script>

<template>
  <div class="mb-4">
    <div class="mt-2 flex justify-between">
      <div class="flex flex-wrap items-center space-x-2 text-xs">
        <Avatar
          :text="
            discussion && discussion.Author?.username
              ? discussion.Author.username
              : '[Deleted]'
          "
          :profile-pic-u-r-l="
            discussion && discussion.Author?.profilePicURL
              ? discussion.Author.profilePicURL
              : ''"
          :is-small="true"
        />
        <router-link
          v-if="discussion && discussion.Author"
          class="cursor-pointer font-bold text-black hover:underline dark:text-white"
          :to="`/u/${discussion.Author.username}`"
        >
          <UsernameWithTooltip
            v-if="discussion.Author.username"
            :username="discussion.Author.username"
            :profile-pic-u-r-l="discussion.Author.profilePicURL ?? ''"
            :display-name="discussion.Author.displayName ?? ''"
            :comment-karma="discussion.Author.commentKarma ?? 0"
            :discussion-karma="discussion.Author.discussionKarma ?? 0"
            :account-created="discussion.Author.createdAt"
          >
            {{ discussion.Author.username }}
          </UsernameWithTooltip>
        </router-link>
        <span v-else>[Deleted]</span>
        <div>{{ createdAt }}</div>
        <span
          v-if="discussion && discussion.updatedAt"
          class="mx-2"
        >
          &#8226;
        </span>
        <div>{{ editedAt }}</div>
      </div>
      <MenuButton
        v-if="discussion && menuItems.length > 0"
        :items="menuItems"
        @copyLink="copyLink"
        @handleEdit="
          router.push(
            `/channels/c/${channelId}/discussions/d/${discussion.id}/edit`,
          )
        "
        @handleDelete="deleteModalIsOpen = true"
      >
        <EllipsisHorizontal
          class="h-6 w-6 cursor-pointer hover:text-black dark:text-gray-300 dark:hover:text-white"
        />
      </MenuButton>
    </div>
    <WarningModal
      :title="'Delete Discussion'"
      :body="'Are you sure you want to delete this discussion?'"
      :open="deleteModalIsOpen"
      @close="deleteModalIsOpen = false"
      @primary-button-click="deleteDiscussion"
    />
    <ErrorBanner
      v-if="deleteDiscussionError"
      class="mt-2"
      :text="deleteDiscussionError.message"
    />
    <Notification
      :show="showCopiedLinkNotification"
      :title="'Copied to clipboard!'"
      @closeNotification="showCopiedLinkNotification = false"
    />
  </div>
</template>
