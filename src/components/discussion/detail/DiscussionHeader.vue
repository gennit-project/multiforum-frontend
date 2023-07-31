<script lang="ts">
import { defineComponent, computed, PropType, ref } from "vue";
import { DiscussionData } from "@/types/discussionTypes";
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

export default defineComponent({
  components: {
    ErrorBanner,
    RequireAuth,
    WarningModal,
    Avatar,
  },
  props: {
    discussion: {
      type: Object as PropType<DiscussionData>,
      required: true,
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
      if (!props.discussion.updatedAt) {
        return "";
      }
      return `Edited ${relativeTime(props.discussion.updatedAt)}`;
    });

    const createdAt = computed(() => {
      return `posted ${relativeTime(props.discussion.createdAt)}`;
    });

    const {
      mutate: deleteDiscussion,
      error: deleteDiscussionError,
      onDone: onDoneDeleting,
    } = useMutation(DELETE_DISCUSSION, {
      variables: {
        id: props.discussion.id,
      },
      update: (cache: any) => {
        cache.modify({
          fields: {
            discussions(existingDiscussionRefs = [], fieldInfo: any) {
              const readField = fieldInfo.readField;

              return existingDiscussionRefs.filter((ref) => {
                return readField("id", ref) !== props.discussion.id;
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
      <p class="flex text-sm mt-2 flex-wrap items-center space-x-2">
        <Avatar v-if="discussion.Author?.username" :text="discussion.Author.username" />

        <router-link
        v-if="discussion.Author"
        class="font-bold cursor-pointer text-black dark:text-white hover:underline"
        :to="`/u/${discussion.Author.username}`"
      >
        {{ discussion.Author.username }}
        </router-link>
        <span v-else>[Deleted]</span>
        <div>{{ createdAt }}</div>
        <span v-if="discussion.updatedAt" class="mx-2"> &#8226; </span>
        <div>{{ editedAt }}</div>
        <RequireAuth
          v-if="discussion?.Author?.username"
          :full-width="false"
          class=" space-x-2 "
          :require-ownership="true"
          :owners="[discussion.Author.username]"
        >
          <template v-slot:has-auth>
            <span class="mx-2"> &#8226;</span>
            <router-link
              class="ml-1 underline font-medium cursor-pointer"
              :to="`/channels/c/${channelId}/discussions/d/${discussion.id}/edit`"
            >
              <span>Edit</span>
            </router-link>
          </template>
        </RequireAuth>
        <RequireAuth
          class=" space-x-2"
          v-if="discussion.Author && route.name === 'DiscussionDetail'"
          :require-ownership="true"
          :owners="[discussion.Author.username]"
          :full-width="false"
        >
          <template v-slot:has-auth>
            <span> &#8226;</span>
            <span
              class="ml-1 underline font-medium cursor-pointer"
              @click="deleteModalIsOpen = true"
              >Delete</span
            >
          </template>
        </RequireAuth>
      </p>



    <WarningModal
      :title="'Delete Discussion'"
      :body="'Are you sure you want to delete this discussion?'"
      :open="deleteModalIsOpen"
      @close="deleteModalIsOpen = false"
      @primaryButtonClick="deleteDiscussion"
    />
    <ErrorBanner
      class="mt-2"
      v-if="deleteDiscussionError"
      :text="deleteDiscussionError.message"
    />
  </div>
</template>
