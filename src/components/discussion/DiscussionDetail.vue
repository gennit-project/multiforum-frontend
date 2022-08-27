<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import Back from "../buttons/Back.vue";
import Tag from "../buttons/Tag.vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { DELETE_DISCUSSION } from "@/graphQLData/discussion/mutations";
import { GET_DISCUSSION } from "@/graphQLData/discussion/queries";
// import { ChannelData } from "@/types/channelTypes";
// import Comment from "../comments/Comment.vue";
import { relativeTime } from "../../dateTimeUtils";
import WarningModal from "../WarningModal.vue";
import { DateTime } from "luxon";
import { DiscussionData } from "@/types/discussionTypes";
import { ChannelData } from "@/types/channelTypes";
import ErrorBanner from "../forms/ErrorBanner.vue";
import CreateButton from "../buttons/CreateButton.vue";
import GenericButton from "../buttons/GenericButton.vue";
import MdEditor from "md-editor-v3";
import "md-editor-v3/lib/style.css";

export default defineComponent({
  components: {
    Back,
    // Comment,
    WarningModal,
    CreateButton,
    ErrorBanner,
    GenericButton,
    MdEditor,
    Tag,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const discussionId = computed(() => {
      return route.params.discussionId;
    });

    const channelId = computed(() => {
      return route.params.channelId;
    });

    const {
      result: getDiscussionResult,
      error: getDiscussionError,
      loading: getDiscussionLoading,
    } = useQuery(GET_DISCUSSION, { id: discussionId });

    const discussion = computed<DiscussionData>(() => {
      if (getDiscussionLoading.value || getDiscussionError.value) {
        return null;
      }
      return getDiscussionResult.value.discussions[0];
    });

    const editedAt = computed(() => {
      if (
        getDiscussionError.value ||
        getDiscussionLoading.value ||
        !discussion.value.updatedAt
      ) {
        return "";
      }
      return `Edited ${relativeTime(discussion.value.updatedAt)}`;
    });

    const createdAt = computed(() => {
      if (getDiscussionLoading.value || getDiscussionError.value) {
        return "";
      }
      return `posted ${relativeTime(discussion.value.createdAt)}`;
    });

    const channelsExceptCurrent = computed(() => {
      if (getDiscussionLoading.value || getDiscussionError.value) {
        return [];
      }

      return discussion.value.Channels.filter((channel: ChannelData) => {
        return channel.uniqueName !== channelId.value;
      });
    });

    const {
      mutate: deleteDiscussion,
      error: deleteDiscussionError,
      onDone: onDoneDeleting,
    } = useMutation(DELETE_DISCUSSION, {
      variables: {
        id: discussionId.value,
      },
      update: (cache: any) => {
        cache.modify({
          fields: {
            discussions(existingDiscussionRefs = [], fieldInfo: any) {
              const readField = fieldInfo.readField;

              return existingDiscussionRefs.filter((ref) => {
                return readField("id", ref) !== discussionId.value;
              });
            },
          },
        });
      },
    });

    onDoneDeleting(() => {
      if (channelId.value) {
        router.push({
          name: "SearchDiscussionsInChannel",
          params: {
            channelId: channelId.value,
          },
        });
      }
    });

    const deleteModalIsOpen = ref(false);

    return {
      channelId,
      channelsExceptCurrent,
      createdAt,
      deleteModalIsOpen,
      getDiscussionResult,
      getDiscussionError,
      getDiscussionLoading,
      discussionId,
      deleteDiscussion,
      deleteDiscussionError,
      editedAt,
      discussion,
      relativeTime,
    };
  },
  methods: {
    filterDiscussionsByTag(tag: string) {
      this.router.push({
        name: "FilterDiscussionsByTag",
        params: {
          tag,
        },
      });
    },
    getFormattedDateString(startTime: string) {
      const startTimeObj = DateTime.fromISO(startTime);

      return startTimeObj.toFormat("cccc LLLL d yyyy");
    },
  },
});
</script>

<template>
  <div class="px-10">
    <Back />
    <p v-if="getDiscussionLoading">Loading...</p>
    <ErrorBanner
      class="mt-2"
      v-else-if="getDiscussionError"
      :text="getDiscussionError.message"
    />
    <div v-else class="mx-auto max-w-6xl divide-y bg-white rounded">
      <div class="flow-root mb-1 flex items-center">
        <h2 class="text-xl py-2 float-left">{{ discussion.title }}</h2>
        <span class="float-right space-x-2">
          <router-link
            :to="`/channels/c/${channelId}/discussions/d/${discussionId}/edit`"
          >
            <GenericButton :text="'Edit'" />
          </router-link>
          <CreateButton
            :to="`/channels/c/${channelId}/discussions/create`"
            :label="'Create Discussion'"
          />
        </span>
      </div>
      <div class="grid grid-cols-3 pt-8">
        <div class="col-start-1 col-span-2">
          <div v-if="discussion.body" class="body min-height-min">
            <md-editor
              v-model="discussion.body"
              language="en-US"
              previewTheme="github"
              preview-only
            />
          </div>
          <Tag
            v-for="tag in discussion.Tags"
            :tag="tag.text"
            :key="tag.text"
            :discussionId="discussionId"
          />
          <div class="text-xs text-gray-600 mt-4">
            <div class="organizer">
              <router-link
                v-if="discussion.Author"
                class="text-blue-800 underline"
                :to="`/u/${discussion.Author.username}`"
              >
                {{ discussion.Author.username }}
              </router-link>
              {{ createdAt }}
              <span v-if="discussion.updatedAt"> &#8226; </span>
              {{ editedAt }}
              &#8226;
              <span
                class="underline font-medium text-gray-900 cursor-pointer"
                @click="deleteModalIsOpen = true"
                >Delete</span
              >
            </div>
            <div v-if="channelId && channelsExceptCurrent.length > 0" class="mt-2">
              Crossposted To Channels:
            </div>
            <ul>
              <li
                v-for="channel in channelsExceptCurrent"
                :key="channel.uniqueName"
              >
                <router-link
                  :key="channel.uniqueName"
                  class="understatedLink underline"
                  :to="`/channels/c/${channel.uniqueName}/discussions/d/${discussionId}`"
                >
                  {{ `c/${channel.uniqueName}` }}
                </router-link>
              </li>
            </ul>
          </div>
        </div>
        <WarningModal
          :title="'Delete Discussion'"
          :body="'Are you sure you want to delete this discussion?'"
          :open="deleteModalIsOpen"
          @close="deleteModalIsOpen = false"
          @delete="deleteDiscussion"
        />
      </div>
    </div>
    <ErrorBanner
      class="mt-2"
      v-if="deleteDiscussionError"
      :text="deleteDiscussionError.message"
    />
  </div>
</template>


