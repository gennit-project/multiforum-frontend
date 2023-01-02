<script lang="ts">
import { GET_DISCUSSION } from "@/graphQLData/discussion/queries";
import { UPDATE_DISCUSSION } from "@/graphQLData/discussion/mutations";
import { defineComponent, computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  useQuery,
  useMutation,
  provideApolloClient,
} from "@vue/apollo-composable";
import { TagData } from "@/types/tagTypes";
import { ChannelData } from "@/types/channelTypes";
import {
  CreateEditDiscussionFormValues,
  DiscussionData,
} from "@/types/discussionTypes";
import { apolloClient } from "@/main";
import CreateEditDiscussionFields from "./CreateEditDiscussionFields.vue";

export default defineComponent({
  name: "EditDiscussion",
  components: {
    CreateEditDiscussionFields,
  },
  apollo: {},
  setup() {
    provideApolloClient(apolloClient);

    const route = useRoute();
    const router = useRouter();

    const channelId: string | string[] = route.params.channelId;
    const discussionId: string | string[] = route.params.discussionId;

    const {
      result: getDiscussionResult,
      onResult: onGetDiscussionResult,
      loading: getDiscussionLoading,
      error: getDiscussionError,
    } = useQuery(GET_DISCUSSION, {
      id: discussionId,
    });

    const discussion = computed<DiscussionData>(() => {
      if (getDiscussionError.value || getDiscussionLoading.value) {
        return null;
      }
      return getDiscussionResult.value.discussions[0];
    });

    const getDefaultFormValues = () => {
      // If the discussion data is already loaded, start with
      // the existing values. This will be used if you load the page,
      // navigate away and come back.
      if (discussion.value) {
        return {
          title: discussion.value.title,
          body: discussion.value.body,
          selectedTags: discussion.value.Tags.map((tag: TagData) => {
            return tag.text;
          }),
          selectedChannels: discussion.value.Channels.map(
            (channel: ChannelData) => {
              return channel.uniqueName;
            }
          ),
          author: discussion.value.Author.username,
        };
      }
      // If the discussion data is loading, start with empty values. These
      // will be overwritten by onGetDiscussionResult function when the discussion
      // data is loaded.
      return {
        title: "",
        body: "",
        selectedTags: [],
        selectedChannels: [],
        author: "cluse",
      };
    };

    const formValues = ref<CreateEditDiscussionFormValues>(
      getDefaultFormValues()
    );

    onGetDiscussionResult((value) => {
      const discussion = value.data.discussions[0];

      formValues.value = {
        title: discussion.title,
        body: discussion.body,
        selectedTags: discussion.Tags.map((tag: TagData) => {
          return tag.text;
        }),
        selectedChannels: discussion.Channels.map((channel: ChannelData) => {
          return channel.uniqueName;
        }),
        author: discussion.Author.username,
      };
    });

    // Remember the existing tags so that if the user removes
    // one or more tags, we will know to manually disconnect
    // the nodes in the async call when the discussion is updated.
    const existingTags = computed(() => {
      if (
        getDiscussionLoading.value ||
        getDiscussionError.value ||
        !getDiscussionResult.value.discussions[0].Tags
      ) {
        return [];
      }
      return getDiscussionResult.value.discussions[0].Tags.map(
        (tag: TagData) => {
          return tag.text;
        }
      );
    });

    const existingChannels = computed(() => {
      if (
        getDiscussionLoading.value ||
        getDiscussionError.value ||
        !getDiscussionResult.value.discussions[0].Channels
      ) {
        return [];
      }
      return getDiscussionResult.value.discussions[0].Channels.map(
        (channel: ChannelData) => {
          return channel.uniqueName;
        }
      );
    });

    const updateDiscussionInput = computed(() => {
      const tagConnections = formValues.value.selectedTags.map(
        (tag: string) => {
          return {
            onCreate: {
              node: {
                text: tag,
              },
            },
            where: {
              node: {
                text: tag,
              },
            },
          };
        }
      );

      const tagDisconnections = existingTags.value
        .filter((tag: string) => {
          return !formValues.value.selectedTags.includes(tag);
        })
        .map((tag: string) => {
          return {
            where: {
              node: {
                text: tag,
              },
            },
          };
        });

      const channelConnections = formValues.value.selectedChannels.map(
        (channel: string) => {
          return {
            where: {
              node: {
                uniqueName: channel,
              },
            },
          };
        }
      );

      const channelDisconnections = existingChannels.value
        .filter((channel: string) => {
          return !formValues.value.selectedChannels.includes(channel);
        })
        .map((channel: string) => {
          return {
            where: {
              node: {
                uniqueName: channel,
              },
            },
          };
        });

      return {
        title: formValues.value.title,
        body: formValues.value.body,
        Channels: {
          connect: channelConnections,
          disconnect: channelDisconnections,
        },
        Tags: {
          connectOrCreate: tagConnections,
          disconnect: tagDisconnections,
        },
      };
    });

    const {
      mutate: updateDiscussion,
      error: updateDiscussionError,
      onDone,
    } = useMutation(UPDATE_DISCUSSION, () => ({
      variables: {
        discussionWhere: {
          id: discussionId,
        },
        updateDiscussionInput: updateDiscussionInput.value,
      },
    }));

    onDone(() => {
      router.push({
        name: "DiscussionDetail",
        params: {
          channelId: formValues.value.selectedChannels[0],
          discussionId,
        },
      });
    });

    // const getCommentSectionObjects = (newDiscussionId: string) => {
    //   return selectedChannels.value.map((c) => {
    //     return {
    //       id: newDiscussionId + c,
    //       Discussion: {
    //         id: newDiscussionId,
    //       },
    //       Channel: {
    //         uniqueName: c,
    //       },
    //     };
    //   });
    // };

    // let touched = ref({
    //   title: false,
    // });

    return {
      channelId,
      discussionId,
      existingChannels,
      existingTags,
      formValues,
      getDiscussionError,
      getDiscussionLoading,
      updateDiscussion,
      updateDiscussionError,
      updateDiscussionInput,
      router,
    };
  },
  methods: {
    async submit() {
      this.updateDiscussion();
    },
    updateFormValues(data: CreateEditDiscussionFormValues) {
      const existingValues = this.formValues;
      this.formValues = {
        ...existingValues,
        ...data,
      };
    },
  },
});
</script>
<template>
  <CreateEditDiscussionFields
    :edit-mode="true"
    :discussion-loading="getDiscussionLoading"
    :get-discussion-error="getDiscussionError"
    :update-discussion-error="updateDiscussionError"
    :form-values="formValues"
    @submit="submit"
    @updateFormValues="updateFormValues"
  />
</template>

<style>
</style>