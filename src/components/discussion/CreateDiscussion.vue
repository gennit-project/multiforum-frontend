<script lang="ts">
import { defineComponent, ref, computed } from "vue";
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
import TextInput from "@/components/forms/TextInput.vue";
import TagPicker from "@/components/forms/TagPicker.vue";
import { apolloClient } from "@/main";
import { DiscussionData } from "@/types/discussionTypes";

import "md-editor-v3/lib/style.css";

export default defineComponent({
  name: "CreateDiscussion",
  components: {
    CancelButton,
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

    const title = ref("");
    const body = ref("");
    const selectedChannels = ref(channelId ? [channelId] : []);
    const selectedTags = ref([]);

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

    const createDiscussionInput = computed(() => {
      const tagConnections = selectedTags.value.map((tag: string) => {
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
      });

      const channelConnections = selectedChannels.value.map(
        (channel: string | string[]) => {
          return {
            where: {
              node: {
                uniqueName: channel,
              },
            },
          };
        }
      );

      return [
        {
          title: title.value,
          body: body.value,
          Channels: {
            connect: channelConnections,
          },
          Tags: {
            connectOrCreate: tagConnections,
          },
          Author: {
            connect: {
              where: {
                node: {
                  username: "cluse",
                },
              },
            },
          },
        },
      ];
    });

    const CREATE_DISCUSSION = gql`
      mutation createDiscussion(
        $createDiscussionInput: [DiscussionCreateInput!]!
      ) {
        createDiscussions(input: $createDiscussionInput) {
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
      mutate: createDiscussion,
      error: createDiscussionError,
      onDone,
    } = useMutation(CREATE_DISCUSSION, () => ({
      variables: {
        createDiscussionInput: createDiscussionInput.value,
      },
      update: (cache: any, result: any) => {
        const newDiscussion: DiscussionData =
          result.data?.createDiscussions?.discussions[0];

        cache.modify({
          fields: {
            discussions(existingDiscussionRefs = [], fieldInfo: any) {
              const readField = fieldInfo.readField;
              const newDiscussionRef = cache.writeFragment({
                data: newDiscussion,
                fragment: gql`
                  fragment NewDiscussion on Discussions {
                    id
                  }
                `,
              });

              // Quick safety check - if the new discussion is already
              // present in the cache, we don't need to add it again.
              if (
                existingDiscussionRefs.some(
                  (ref: any) => readField("id", ref) === newDiscussion.id
                )
              ) {
                return existingDiscussionRefs;
              }
              return [newDiscussionRef, ...existingDiscussionRefs];
            },
          },
        });
      },
    }));

    onDone((response: any) => {
      // Add a new comment section for each selected channel.
      // createCommentSections({
      //   variables: {
      //     commentSectionObjects: getCommentSectionObjects(newDiscussionId),
      //   },
      // });
      const newDiscussionId = response.data.createDiscussions.discussions[0].id;

      /*
        If the discussion was created in the context
        of a channel, redirect to the discussion detail page in
        the channel.
      */

      if (channelId) {
        router.push({
          name: "DiscussionDetail",
          params: {
            channelId,
            discussionId: newDiscussionId,
          },
        });
      } else {
        /*
        If the discussion was created in the context
        of the server-wide discussions page,
        redirect to the discussion detail page in the first
        channel that the discussion was submitted to.
      */
        router.push({
          name: "DiscussionDetail",
          params: {
            channelId: selectedChannels.value[0],
            discussionId: newDiscussionId,
          },
        });
      }
    });

    return {
      channelId,
      channelData,
      channelError,
      channelLoading,
      createDiscussion,
      createDiscussionError,
      createDiscussionInput,
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
        this.selectedChannels.length > 0 && this.title.length > 0
      );
      return needsChanges;
    },
  },
  methods: {
    setSelectedTags(tags: Array<string>){
      this.selectedTags.value = tags;
    },
    setSelectedChannels (channels: Array<string>) {
      this.selectedChannels.value = channels;
    },
    getChannelOptionLabels(options: Array<ChannelData>) {
      return options.map((channel) => channel.uniqueName);
    },
    getTagOptionLabels(options: Array<TagData>) {
      return options.map((tag) => tag.text);
    },
    updateBody(updated: string) {
      this.body = updated;
    },
    updateText(updated: string) {
      this.title = updated;
    },
    async submit() {
      this.createDiscussion();
    },
    cancel() {
      if (this.channelId) {
        this.router.push({
          name: "SearchDiscussionsInChannel",
          params: {
            channelId: this.channelId,
          },
        });
      } else {
        this.router.push({
          name: "SearchDiscussions",
        });
      }
    },
  },
});
</script>
<template>
  <div>
    <Form>
      <div v-if="channelLoading || tagsLoading">Loading...</div>
      <div v-if="createDiscussionError">{{ createDiscussionError }}</div>
      <div class="space-y-8 divide-y divide-gray-200 sm:space-y-5">
        <div>
          <FormTitle>Create Discussion</FormTitle>

          <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
            <FormRow :section-title="'Title'">
              <TextInput
                :value="title"
                :full-width="true"
                @update="updateText"
              />
            </FormRow>

            <FormRow :section-title="'Channel(s)'">
              <TagPicker
                v-if="channelData && channelData.channels"
                :tag-options="getChannelOptionLabels(channelData.channels)"
                :initial-value="selectedChannels"
                @setSelectedTags="setSelectedChannels"
              />
            </FormRow>

            <FormRow :section-title="'Body'">
              <TextEditor class="mb-3" :value="body" @update="updateBody" />
            </FormRow>

            <FormRow :section-title="'Tags'">
         
              <TagPicker
                v-if="tagsData && tagsData"
                :tag-options="getTagOptionLabels(tagsData.tags)"
                :initial-value="selectedTags"
                @setSelectedTags="setSelectedTags"
              />
            </FormRow>
          </div>
        </div>
      </div>

      <div class="pt-5">
        <div class="flex justify-end">
          <CancelButton @click="cancel" />
          <SaveButton @click.prevent="submit" :disabled="changesRequired" />
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