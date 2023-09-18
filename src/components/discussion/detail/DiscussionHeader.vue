<script lang="ts">
import { defineComponent, computed, PropType, ref } from "vue";
import { Discussion } from "@/__generated__/graphql";
import { useMutation } from "@vue/apollo-composable";
import RequireAuth from "@/components/auth/RequireAuth.vue";
import { useRoute, useRouter } from "vue-router";
import { relativeTime } from "@/dateTimeUtils";
import { DateTime } from "luxon";
import { DELETE_DISCUSSION } from "@/graphQLData/discussion/mutations";
import WarningModal from "../../generic/WarningModal.vue";
import ErrorBanner from "../../generic/ErrorBanner.vue";
import Avatar from "@/components/user/Avatar.vue";
import { useDisplay } from "vuetify";
import UsernameWithTooltip from "@/components/generic/UsernameWithTooltip.vue";

export default defineComponent({
  components: {
    ErrorBanner,
    RequireAuth,
    WarningModal,
    Avatar,
    UsernameWithTooltip
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

    const deleteModalIsOpen = ref(false);

    const { lgAndDown, lgAndUp, mdAndDown, mdAndUp, xlAndUp } = useDisplay();

    return {
      createdAt,
      deleteModalIsOpen,
      deleteDiscussion,
      deleteDiscussionError,
      editedAt,
      route,
      router,
      lgAndDown,
      lgAndUp,
      mdAndDown,
      mdAndUp,
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
    <div class="mt-2 flex flex-wrap items-center space-x-2 text-sm">
      <Avatar
        :text="
          discussion && discussion.Author?.username
            ? discussion.Author.username
            : '[Deleted]'
        "
      />
      <router-link
        v-if="discussion && discussion.Author"
        class="cursor-pointer font-bold text-black hover:underline dark:text-white"
        :to="`/u/${discussion.Author.username}`"
      >
        <UsernameWithTooltip
          v-if="discussion.Author.username"
          :username="discussion.Author.username"
          :comment-karma="discussion.Author.commentKarma ?? 0"
          :discussion-karma="discussion.Author.discussionKarma ?? 0"
          :account-created="discussion.Author.createdAt"
        >
          {{ discussion.Author.username }}
        </UsernameWithTooltip>
      </router-link>
      <span v-else>[Deleted]</span>
      <div>{{ createdAt }}</div>
      <span v-if="discussion && discussion.updatedAt" class="mx-2">
        &#8226;
      </span>
      <div>{{ editedAt }}</div>
      <RequireAuth
        v-if="discussion?.Author?.username && channelId"
        :full-width="false"
        class="space-x-2"
        :require-ownership="true"
        :owners="[discussion.Author.username]"
      >
        <template #has-auth>
          <span class="mx-2"> &#8226;</span>
          <router-link
            class="font-medium ml-1 cursor-pointer underline"
            :to="`/channels/c/${channelId}/discussions/d/${discussion.id}/edit`"
          >
            <span>Edit</span>
          </router-link>
        </template>
      </RequireAuth>
      <RequireAuth
        v-if="
          discussion && discussion.Author && route.name === 'DiscussionDetail'
        "
        class="space-x-2"
        :require-ownership="true"
        :owners="[discussion.Author.username]"
        :full-width="false"
      >
        <template #has-auth>
          <span> &#8226;</span>
          <span
            class="font-medium ml-1 cursor-pointer underline"
            @click="deleteModalIsOpen = true"
            >Delete</span
          >
        </template>
      </RequireAuth>
      <router-link
        v-if="discussion"
        data-testid="discussion-permalink"
        class="font-medium"
        :to="`/channels/c/${discussion.DiscussionChannels[0].channelUniqueName}/discussions/d/${discussion.id}`"
      >
        <span> &#8226;</span>
        <span class="ml-2 cursor-pointer underline">Permalink</span>
      </router-link>
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
  </div>
</template>
