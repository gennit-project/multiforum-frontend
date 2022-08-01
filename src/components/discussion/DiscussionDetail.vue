<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMutation, useQuery } from "@vue/apollo-composable";
import { GET_DISCUSSION } from "@/graphQLData/discussion/queries";
import { DELETE_DISCUSSION } from "@/graphQLData/discussion/mutations";
import { ChannelData } from "@/types/channelTypes";
import Tag from "../buttons/Tag.vue";
import { relativeTime } from "../../dateTimeUtils";
import Comment from "../comments/Comment.vue";
import ConfirmDelete from "../ConfirmDelete.vue";
import ErrorBanner from "../forms/ErrorBanner.vue";

export default defineComponent({
  components: {
    Comment,
    ConfirmDelete,
    ErrorBanner,
    Tag,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const discussionId = computed(() => {
      if (typeof route.params.discussionId === "string") {
        return route.params.discussionId;
      }
      return "";
    });
    const channelId = computed(() => {
      return route.params.channelId;
    });

    const {
      mutate: deleteDiscussion,
      error: deleteDiscussionError,
      onDone: onDoneDeleting,
      // @ts-ignore
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

    const { result, loading } = useQuery(GET_DISCUSSION, { id: discussionId });

    const body = computed(() => {
      if (!result.value || !result.value.discussions) {
        return "";
      }
      return result.value.discussions[0]?.body;
    });

    const title = computed(() => {
      if (!result.value || !result.value.discussions) {
        return "[Deleted]";
      }
      return result.value.discussions[0]?.title;
    });

    const tags = computed(() => {
      if (!result.value || !result.value.discussions) {
        return [];
      }
      return result.value.discussions[0]?.Tags;
    });

    const channelsExceptCurrent = computed(() => {
      if (
        !result.value ||
        !result.value.discussions ||
        !result.value.discussions[0] ||
        !result.value.discussions[0].Channels ||
        result.value.discussions[0].Channels?.length < 2
      ) {
        return [];
      }
      return (
        result.value.discussions[0]?.Channels.filter((channel: ChannelData) => {
          return channel.uniqueName !== channelId.value;
        }) || []
      );
    });

    const authorUsername = computed(() => {
      const defaultValue = "[deleted]";
      if (!result.value || !result.value.discussions) {
        return defaultValue;
      }
      return result.value.discussions[0]?.Author?.username || defaultValue;
    });

    const createdAt = computed(() => {
      if (!result.value || !result.value.discussions) {
        return "";
      }
      const time = result.value.discussions[0]?.createdAt || "";
      return `posted this discussion ${relativeTime("" + time)}`;
    });

    const updatedAt = computed(() => {
      if (!result.value || !result.value.discussions) {
        return "";
      }
      const time = result.value.discussions[0]?.updatedAt || "";

      if (time) {
        return `Edited ${relativeTime("" + time)}`;
      }
      return "";
    });

    const confirmDeleteIsOpen = ref(false);

    return {
      authorUsername,
      body,
      channelsExceptCurrent,
      confirmDeleteIsOpen,
      createdAt,
      deleteDiscussion,
      deleteDiscussionError,
      tags,
      title,
      channelId,
      discussionId,
      loading,
      relativeTime,
      result,
      router,
      updatedAt,
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
  },
});
</script>

<template>
  <div class="container mx-auto">
    <ErrorBanner
      class="mt-2"
      v-if="deleteDiscussionError"
      :text="deleteDiscussionError.message"
    />
    <div class="pb-5 border-b border-gray-200">
      <h1 class="text-2xl mt-8 leading-6 font-medium text-gray-900">
        {{ title }}
      </h1>
      <div class="prose w-full text-xs mt-4">
        <router-link v-if="authorUsername" :to="`/u/${authorUsername}`">
          {{ authorUsername }}
        </router-link>
        {{ createdAt }}
        <span v-if="updatedAt"> &#8226; </span>
        {{ updatedAt }}
        <span>
          &#8226;
          <router-link
            :to="`/channels/c/${channelId}/discussions/d/${discussionId}/edit`"
            >Edit</router-link
          > </span
        >&#8226;
        <span
          class="underline font-medium text-gray-900 cursor-pointer"
          @click="confirmDeleteIsOpen = true"
          >Delete</span
        >
      </div>
    </div>

    <div v-if="loading">Loading...</div>

    <div class="grid md:grid-cols-12">
      <Comment
        v-if="body"
        :author-username="authorUsername"
        :created-at="createdAt || ''"
        :content="body"
      />

      <div class="md:col-span-3 mt-6">
        <div v-if="tags && tags.length > 0">
          <h2
            class="
              text-md
              leading-6
              mb-2
              font-medium
              text-gray-700
              border-b border-gray-200
            "
          >
            Tags
          </h2>
          <div class="flex flex-wrap">
            <Tag
              class="mb-1"
              v-for="tag in tags"
              :tag="tag.text"
              :key="tag.text"
              :discussionId="discussionId"
              @click="filterDiscussionsByTag(tag.text)"
            />
          </div>
        </div>
        <div v-if="channelsExceptCurrent.length > 0" class="space-x-1">
          <h2
            class="
              text-md
              leading-6
              mb-2
              mt-6
              font-medium
              text-gray-700
              border-b border-gray-200
            "
          >
            Crossposted To Channels
          </h2>
          <div class="flex flex-wrap">
            <router-link
              class="mb-1 mr-2 underline"
              v-for="channel in channelsExceptCurrent"
              :key="channel.uniqueName"
              :to="`/channels/c/${channel.uniqueName}/discussions/d/${discussionId}`"
            >
              {{ `${channel.uniqueName}` }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
    <ConfirmDelete
      :open="confirmDeleteIsOpen"
      :title="'Delete Discussion'"
      :body="'Are you sure you want to delete this discussion?'"
      @close="confirmDeleteIsOpen = false"
      @delete="deleteDiscussion"
    />
  </div>
</template>
