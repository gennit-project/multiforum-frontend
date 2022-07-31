<script lang="ts">
import { GET_DISCUSSION } from "@/graphQLData/discussion/queries";

import { defineComponent, computed, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  useQuery,
  useMutation,
  provideApolloClient,
} from "@vue/apollo-composable";
import { gql } from "@apollo/client/core";
import { ChannelData } from "@/types/channelTypes";
// import { DiscussionData } from "@/types/discussionTypes";
import { TagData } from "@/types/tagTypes";
import CancelButton from "@/components/buttons/CancelButton.vue";
import SaveButton from "@/components/buttons/SaveButton.vue";
import TextEditor from "@/components/forms/TextEditor.vue";
import FormTitle from "@/components/forms/FormTitle.vue";
import FormRow from "@/components/forms/FormRow.vue";
import Form from "@/components/forms/Form.vue";
import ErrorBanner from "@/components/forms/ErrorBanner.vue";
import TextInput from "@/components/forms/TextInput.vue";
import TagPicker from "@/components/forms/TagPicker.vue";
import { apolloClient } from "@/main";

export default defineComponent({
  name: "EditDiscussion",
  components: {
    CancelButton,
    ErrorBanner,
    Form,
    FormRow,
    FormTitle,
    SaveButton,
    TagPicker,
    TextEditor,
    TextInput,
  },
  apollo: {},
  setup() {
    provideApolloClient(apolloClient);

    const route = useRoute();
    const router = useRouter();

    const channelId: string | string[] = route.params.channelId;
    const discussionId: string | string[] = route.params.discussionId;

    const { result, loading: discussionLoading } = useQuery(GET_DISCUSSION, {
      id: discussionId,
    });

    const existingBody = computed(() => {
      if (!result.value) {
        return "";
      }
      return result.value.data.discussions[0]?.body || "";
    });

    const existingTitle = computed(() => {
      if (!result.value) {
        return "";
      }
      return result.value.data.discussions[0]?.title;
    });
    const existingTags = computed(() => {
      if (!result.value) {
        return [];
      }
      return result.value.data.discussions[0].Tags.map((tag: TagData) => {
        return tag.text;
      });
    });

    const existingChannels = computed(() => {
      if (!result.value || !result.value.data.discussions[0].Channels) {
        return [];
      }
      return result.value.data.discussions[0].Channels.map(
        (channel: ChannelData) => {
          return channel.uniqueName;
        }
      );
    });

    // The form fields in the edit form are initialized
    // with the existing values.

    const body = ref(existingBody.value);
    const title = ref(existingTitle.value);
    const selectedChannels = ref(existingChannels.value);
    const selectedTags = ref(existingTags.value);

    watch(result, (value) => {
      // Used so that some form validation can occur as
      // soon as the page is loaded
      const discussionData = value.discussions[0];

      if (discussionData) {
        title.value = discussionData.title;
        body.value = discussionData.body;
        selectedChannels.value = discussionData.Channels.map(
          (channel: ChannelData) => {
            return channel.uniqueName;
          }
        );
        selectedTags.value = discussionData.Tags.map((tag: TagData) => {
          return tag.text;
        });
      }
    });

    const username = "cluse";

    const GET_CHANNEL_NAMES = gql`
      query getChannelNames {
        channels {
          uniqueName
        }
      }
    `;

    const {
      loading: channelLoading,
      error: channelError,
      result: channelData,
    } = useQuery(GET_CHANNEL_NAMES);

    const GET_TAGS = gql`
      query {
        tags {
          text
        }
      }
    `;

    const {
      loading: tagsLoading,
      error: tagsError,
      result: tagsData,
    } = useQuery(GET_TAGS);

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

    const updateDiscussionInput = computed(() => {
      const tagConnections = selectedTags.value
        ? selectedTags.value.map((tag: string) => {
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
          })
        : [];

      const tagDisconnections = existingTags.value
        .filter((tag: string) => {
          return !selectedTags.value.includes(tag);
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

      const channelConnections = selectedChannels.value
        ? selectedChannels.value.map((channel: string) => {
            return {
              where: {
                node: {
                  uniqueName: channel,
                },
              },
            };
          })
        : [];

      const channelDisconnections = existingChannels.value
        .filter((channel: string) => {
          return !selectedChannels.value.includes(channel);
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
        title: title.value,
        body: body.value,
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

    const UPDATE_DISCUSSION = gql`
      mutation updateDiscussion(
        $updateDiscussionInput: DiscussionUpdateInput
        $discussionWhere: DiscussionWhere
      ) {
        updateDiscussions(
          update: $updateDiscussionInput
          where: $discussionWhere
        ) {
          discussions {
            id
            title
            body
            Channels {
              uniqueName
            }
            Author {
              username
            }
            createdAt
            updatedAt
            Tags {
              text
            }
          }
        }
      }
    `;

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
          channelId: selectedChannels.value[0],
          discussionId,
        },
      });
    });

    return {
      channelId,
      channelData,
      channelError,
      channelLoading,
      discussionId,
      existingBody,
      existingChannels,
      existingTags,
      existingTitle,
      discussionLoading,
      updateDiscussion,
      updateDiscussionError,
      updateDiscussionInput,
      body,
      router,
      selectedChannels,
      selectedTags,
      tagsData,
      tagsLoading,
      tagsError,
      title,
      username,
    };
  },
  computed: {
    changesRequired() {
      // We do these checks:
      // - At least one channel is selected
      // - Title is included
      // console.log('Debug changes required', {
      //   title,
      //   selectedChannels
      // })
      const needsChanges = !(
        this.selectedChannels &&
        this.selectedChannels.length > 0 &&
        this.title.length > 0
      );
      return needsChanges;
    },
    saveButtonTooltip() {
      if (!this.selectedChannels || this.selectedChannels.length === 0) {
        return "At least one channel is required.";
      }
      if (!this.title) {
        return "A title is required.";
      }
      return "Save";
    },
  },
  methods: {
    getChannelOptionLabels(options: Array<ChannelData>) {
      return options.map((channel) => channel.uniqueName);
    },
    getTagOptionLabels(options: Array<TagData>) {
      return options.map((tag) => tag.text);
    },
    updateBody(updated: string) {
      this.body = updated;
    },
    updateTitle(updated: string) {
      this.title = updated;
    },
    setSelectedChannels(updated: string[]) {
      this.selectedChannels = updated;
    },
    setSelectedTags(updated: string[]) {
      this.selectedTags = updated;
    },
    async submit() {
      this.updateDiscussion();
    },
    cancel() {
      this.router.push({
        name: "DiscussionDetail",
        params: {
          channelId: this.channelId,
          discussionId: this.discussionId,
        },
      });
    },
  },
});
</script>
<template>
  <div>
    <Form>
      <ErrorBanner
        v-if="updateDiscussionError"
        :text="updateDiscussionError.message"
      />
      <div v-if="channelLoading || tagsLoading || discussionLoading">
        Loading...
      </div>
      <div v-else class="space-y-8 divide-y pt-2 divide-gray-200 sm:space-y-5">
        <div>
          <FormTitle>Edit Discussion</FormTitle>

          <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
            <FormRow :section-title="'Title'">
              <TextInput
                :initial-value="existingTitle"
                :full-width="true"
                @update="updateTitle"
              />
            </FormRow>

            <FormRow :section-title="'Channel(s)'">
              <!-- <ChannelPicker
                v-if="channelData && channelData.channels"
                :initial-value="existingChannels"
                :channel-options="getChannelOptionLabels(channelData.channels)"
                @setSelectedChannels="setSelectedChannels"
              /> -->
            </FormRow>

            <FormRow :section-title="'Body'">
              <TextEditor
                class="mb-3"
                :initial-value="existingBody"
                @update="updateBody"
              />
            </FormRow>

            <FormRow :section-title="'Tags'">
              <!-- <TagPicker
                class="mt-3 mb-3"
                v-if="tagsData && tagsData"
                :initial-value="existingTags"
                :tag-options="getTagOptionLabels(tagsData.tags)"
                @setSelectedTags="setSelectedTags"
              /> -->
            </FormRow>
          </div>
        </div>
      </div>

      <div class="pt-5">
        <div class="flex justify-end">
          <CancelButton @click="cancel" />
          <SaveButton
            @click.prevent="submit"
            :disabled="changesRequired"
            :title="saveButtonTooltip"
          />
        </div>
      </div>
    </Form>

    <div v-for="(error, i) of channelError?.graphQLErrors" :key="i">
      {{ error.message }}
    </div>
    <div v-for="(error, i) of tagsError?.graphQLErrors" :key="i">
      {{ error.message }}
    </div>
  </div>
</template>

<style>
</style>