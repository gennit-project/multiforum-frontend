<script lang="ts">
import { defineComponent, ref } from "vue";
import {
  useQuery,
  useMutation,
  provideApolloClient,
} from "@vue/apollo-composable";
import { gql } from "@apollo/client/core";
import { useRoute } from "vue-router";
import { ChannelData } from "@/types/channelTypes";
import { TagData } from "@/types/tagTypes";
import CancelButton from "@/components/buttons/CancelButton.vue";
import SaveButton from "@/components/buttons/SaveButton.vue";
import TextEditor from "@/components/forms/TextEditor.vue";
import FormTitle from "@/components/forms/FormTitle.vue";
import FormRow from "@/components/forms/FormRow.vue";
import Form from "@/components/forms/Form.vue";
import TextInput from "@/components/forms/TextInput.vue";
import ChannelPicker from "../ChannelPicker.vue";
import TagPicker from "../TagPicker.vue";
import { apolloClient } from "@/main";

export default defineComponent({
  name: "CreateEditDiscussion",
  components: {
    CancelButton,
    ChannelPicker,
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

    const channelId = route.params.channelId as string;

    const username = "cluse";

    const title = ref("");
    const body = ref("");
    const selectedChannels = ref(channelId ? [channelId] : []);
    const selectedTags = ref([]);

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

    return {
      channelId,
      channelData,
      channelError,
      channelLoading,
      body,
      selectedChannels,
      selectedTags,
      tagsData,
      tagsLoading,
      tagsError,
      title,
      username,
    };
  },
  props: {
    mode: {
      type: String,
      default: "create",
    },
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
    buildChannelString() {
      // Connect the discussion to existing channels.
      if (this.selectedChannels.length === 0) {
        throw new Error(
          "Cannot create a discussion without selecting at least one channel."
        );
      }
      let channelString = "";

      this.selectedChannels.forEach((channel: ChannelData) => {
        channelString += `
        {
          where: {
            node: {
              uniqueName: "${channel}"
            }
          }
        },`;
      });

      return `Channels: {
        connect: [${channelString}]
      }`;
    },
    buildTagString() {
      // Connect the discussion to existing tags
      if (this.selectedTags.length === 0) {
        return "";
      }
      let tagString = "";

      this.selectedTags.forEach((tag: TagData) => {
        tagString += `
        {
          onCreate: {
            node: {
              text: ${tag}
            }
          }
          where: {
            node: {
              text: ${tag}
            }
          }
        },
        `;
      });
      return `Tags: {
        connectOrCreate: [${tagString}]
      }`;
    },
    buildBodyString() {
      if (!this.body) {
        return "";
      }
      return `body: "${this.body}"`;
    },
    async onSubmit1() {
      let CREATE_DISCUSSION;
      let createDiscussionMutationString;

    //   try {
        createDiscussionMutationString = `
          mutation {
            createDiscussions(
              input: [
                {
                  title: "${this.title}"
                  ${this.buildBodyString()}
                  ${this.buildChannelString()}
                  ${this.buildTagString()}
                  Author: {
                    connect: {
                      where: {
                        node: {
                          username: "${this.username}"
                        }
                      }
                    }
                  }
                }
              ]
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
        debugger
        CREATE_DISCUSSION = gql`
          ${createDiscussionMutationString}
        `;
    //   } catch (err) {
    //       console.log(err)
    //     throw new Error(`${err} ${createDiscussionMutationString}`);
    //   }
    //   debugger

      const { mutate: createDiscussion } = useMutation(CREATE_DISCUSSION, {
        errorPolicy: "all",
      });
      await createDiscussion()
        .then((d) => {
          console.log(d);
        })
        .catch((err) => {
          console.log(err);
        });
      this.$router.push(
              `/c/${this.selectedChannels.value[0]}/discussions`
            );
      // {
      //   errorPolicy: "all",
      //   update(cache, { data: { discussions } }) {
      //     const newDiscussionId = discussions.discussion[0].id;

      //     // Add a new comment section for each selected channel.
      //     // createCommentSections({
      //     //   variables: {
      //     //     commentSectionObjects: getCommentSectionObjects(newDiscussionId),
      //     //   },
      //     // });

      //     // If the discussion was created in the context
      //     // of a channel, redirect to the discussion detail page in
      //     // the channel.
      //     if (this.channelId) {
      //       this.$router.push(`/c/${this.channelId}/discussions/${newDiscussionId}`);
      //     } else {
      //       // If the discussion was created in the context
      //       // of the server-wide discussions page,
      //       // redirect to the discussion detail page in the first
      //       // channel that the discussion was submitted to.
      //       this.$router.push(
      //         `/c/${this.selectedChannels.value[0]}/discussions/${newDiscussionId}`
      //       );
      //     }
      //     const newDiscussion = discussions.discussion[0];
      //     cache.modify({
      //       fields: {
      //         discussions(existingDiscussionRefs = [], { readField }) {
      //           const newDiscussionRef = cache.writeFragment({
      //             data: newDiscussion,
      //             fragment: gql`
      //               fragment NewDiscussion on Discussions {
      //                 id
      //               }
      //             `,
      //           });

      //           // Quick safety check - if the new discussion is already
      //           // present in the cache, we don't need to add it again.
      //           if (
      //             existingDiscussionRefs.some(
      //               (ref: any) => readField("id", ref) === newDiscussion.id
      //             )
      //           ) {
      //             return existingDiscussionRefs;
      //           }
      //           return [newDiscussionRef, ...existingDiscussionRefs];
      //         },
      //       },
      //     });
      //   },
      // }
      // );
      // if (createDiscussionError) {
      //   throw new Error(createDiscussionError.toString())
      // }
    },
    updateTitle(updated: String) {
      this.title = updated;
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
    setTagFilters(tag: Array<string>) {
      this.selectedTags = tag;
    },
    setChannelFilters(channel: Array<string>) {
      this.selectedChannels = channel;
    },
  },
});
</script>
<template>
  <div>
    <Form>
      <div v-if="channelLoading || tagsLoading"></div>
      <div class="space-y-8 divide-y divide-gray-200 sm:space-y-5">
        <div>
          <FormTitle> Create Discussion </FormTitle>

          <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
            <FormRow :section-title="'Title'">
              <TextInput
                :value="title"
                :full-width="true"
                @update="updateTitle"
              />
            </FormRow>

            <FormRow :section-title="'Channel(s)'">
              <ChannelPicker
                v-if="channelData && channelData.channels"
                v-model="selectedChannels"
                :channel-options="getChannelOptionLabels(channelData.channels)"
                :selected-channels="selectedChannels"
                @setChannelFilters="setChannelFilters"
              />
            </FormRow>

            <FormRow :section-title="'More Info'">
              <TextEditor class="mb-3" :value="body" @update="updateBody" />

              <TagPicker
                class="mt-3 mb-3"
                v-if="tagsData && tagsData"
                v-model="selectedTags"
                :tag-options="getTagOptionLabels(tagsData.tags)"
                :selected-tags="selectedTags"
                @setTagFilters="setTagFilters"
              />
            </FormRow>
          </div>
        </div>
      </div>

      <div class="pt-5">
        <div class="flex justify-end">
          <CancelButton />
          <SaveButton @click="onSubmit1" />
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