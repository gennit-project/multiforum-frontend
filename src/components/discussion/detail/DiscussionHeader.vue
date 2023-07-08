<script lang="ts">
import { defineComponent, computed, PropType, ref } from "vue";
import { DiscussionData } from "@/types/discussionTypes";
import { useMutation } from "@vue/apollo-composable";
import GenericButton from "../../generic/GenericButton.vue";
import RequireAuth from "@/components/auth/RequireAuth.vue";
import { useRoute, useRouter } from "vue-router";
import { relativeTime } from "@/dateTimeUtils";
import { DateTime } from "luxon";
import { DELETE_DISCUSSION } from "@/graphQLData/discussion/mutations";
import WarningModal from "../../generic/WarningModal.vue";
import ErrorBanner from "../../generic/ErrorBanner.vue";
import CreateButton from "@/components/generic/CreateButton.vue";
import PrimaryButton from "@/components/generic/PrimaryButton.vue";
import { useDisplay } from "vuetify";

export default defineComponent({
  components: {
    CreateButton,
    ErrorBanner,
    GenericButton,
    PrimaryButton,
    RequireAuth,
    WarningModal,
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
    <div class="min-w-0">
      <h2
        class="text-2xl font-bold leading-7 sm:tracking-tight sm:truncate"
      >
        {{ discussion.title }}
      </h2>
      <div :class="'mt-4 flex justify-between align-center'" v-if="route.name === 'DiscussionDetail'">
        <RequireAuth
          class="inline-flex max-w-sm"
          :require-ownership="true"
          :owners="[discussion.Author.username]"
        >
          <template v-slot:has-auth>
            <router-link
              :to="`/channels/c/${channelId}/discussions/d/${discussion.id}/edit`"
            >
              <GenericButton :text="'Edit'" />
            </router-link>
          </template>
        </RequireAuth>
        <RequireAuth class="inline-flex max-w-sm">
          <template v-slot:has-auth>
            <CreateButton
              class="ml-2"
              :to="`/channels/c/${channelId}/discussions/create`"
              :label="'+ Create Discussion'"
            />
          </template>
          <template v-slot:does-not-have-auth>
            <PrimaryButton class="ml-2" :label="'+ Create Discussion'" />
          </template>
        </RequireAuth>
      </div>
    </div>

    <div class="text-xs mt-4">
      <div class="mb-2 mt-4">
        <router-link
          v-if="discussion.Author"
          class="underline"
          :to="`/u/${discussion.Author.username}`"
        >
          {{ discussion.Author.username }}
        </router-link>
        <span v-else>[Deleted]</span>
        {{ createdAt }}
        <span v-if="discussion.updatedAt"> &#8226; </span>
        {{ editedAt }}

        <RequireAuth
          class="flex inline-flex max-w-sm"
          v-if="discussion.Author && route.name === 'DiscussionDetail'"
          :require-ownership="true"
          :owners="[discussion.Author.username]"
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
      </div>
      <span
        v-if="route.name !== 'DiscussionDetail' && channelId"
        class="ml-1 mr-1"
        ><router-link
          data-testid="discussion-permalink"
          v-if="route.name !== 'DiscussionDetail' && channelId"
          class="border bg-blue-100 dark:bg-blue-700 border-blue-200 px-3 py-1 mt-1 rounded-sm hover:bg-blue-200 font-medium cursor-pointer"
          :to="`/channels/c/${channelId}/discussions/d/${discussion.id}`"
          >Permalink</router-link
        ></span
      >
    </div>
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
