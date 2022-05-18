<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  useQuery,
  useMutation,
  // useResult,
  provideApolloClient,
} from "@vue/apollo-composable";
import { gql } from "@apollo/client/core";
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
import { ChannelData } from "@/types/channelTypes";
import { isAlphaNumeric } from "@/utils/formValidation";

export default defineComponent({
  name: "CreateChannel",
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

    const uniqueName = ref("");
    const description = ref("");
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

    const createChannelInput = computed(() => {
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

      return [
        {
          uniqueName: uniqueName.value,
          description: description.value,
          Tags: {
            connectOrCreate: tagConnections,
          },
          Admins: {
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

    const CREATE_CHANNEL = gql`
      mutation createChannel($createChannelInput: [ChannelCreateInput!]!) {
        createChannels(input: $createChannelInput) {
          channels {
            uniqueName
            description
            Admins {
              username
            }
            createdAt
            Tags {
              text
            }
          }
        }
      }
    `;

    const {
      mutate: createChannel,
      error: createChannelError,
      onDone,
    } = useMutation(CREATE_CHANNEL, () => ({
      variables: {
        createChannelInput: createChannelInput.value,
      },
      update: (cache: any, result: any) => {
        const newChannel: ChannelData =
          result.data?.createChannels?.channels[0];

        cache.modify({
          fields: {
            channels(existingChannelRefs = [], fieldInfo: any) {
              const readField = fieldInfo.readField;
              const newChannelRef = cache.writeFragment({
                data: newChannel,
                fragment: gql`
                  fragment NewChannel on Channels {
                    uniqueName
                  }
                `,
              });

              // Quick safety check - if the new channel is already
              // present in the cache, we don't need to add it again.
              if (
                existingChannelRefs.some(
                  (ref: any) =>
                    readField("uniqueName", ref) === newChannel.uniqueName
                )
              ) {
                return existingChannelRefs;
              }
              return [newChannelRef, ...existingChannelRefs];
            },
          },
        });
      },
    }));

    onDone((response: any) => {
      const newChannelId = response.data.createChannels.channels[0].uniqueName;

      router.push({
        name: "Channel",
        params: {
          channelId: newChannelId,
        },
      });
    });

    return {
      isAlphaNumeric,
      channelId,
      channelData,
      channelError,
      channelLoading,
      createChannel,
      createChannelError,
      createChannelInput,
      description,
      selectedChannels,
      selectedTags,
      tagsData,
      tagsLoading,
      tagsError,
      uniqueName,
      username,
    };
  },
  computed: {
    uniqueNameIsAlphanumeric(){
      return this.isAlphaNumeric(this.uniqueName)
    },
    uniqueNameErrorMessage() {
      if (!this.isAlphaNumeric(this.uniqueName)) {
        return "Must contain only alphanumeric characters."
      }
      return ''
    },
    changesRequired() {
      // We do these checks:
      // - UniqueName is included

      const needsChanges = !this.uniqueName || !this.uniqueNameIsAlphanumeric;
      return needsChanges;
    },
  },
  methods: {
    getChannelOptionLabels(options: Array<ChannelData>) {
      return options.map((channel) => channel.uniqueName);
    },
    getTagOptionLabels(options: Array<TagData>) {
      return options.map((tag) => tag.text);
    },
    updateDescription(updated: string) {
      this.description = updated;
    },
    updateText(updated: string) {
      this.uniqueName = updated;
    },
    async submit() {
      this.createChannel();
    },
  },
});
</script>
<template>
  <div>
    <Form>
      <div v-if="channelLoading || tagsLoading">Loading...</div>
      <div v-if="createChannelError">{{ createChannelError }}</div>
      <div class="space-y-8 divide-y divide-gray-200 sm:space-y-5">
        <div>
          <FormTitle>Create Channel</FormTitle>

          <div class="mt-6 sm:mt-5 space-y-4 sm:space-y-5">
            <FormRow :section-title="'Unique Name'">
              <TextInput
                :initial-value="uniqueName"
                :full-width="true"
                :invalid="!uniqueNameIsAlphanumeric"
                :error-message="uniqueNameErrorMessage"
                @update="updateText"
              />
            </FormRow>

            <FormRow :section-title="'Description'">
              <TextEditor
                class="mb-3"
                :initial-value="description"
                @update="updateDescription"
              />
            </FormRow>

            <FormRow :section-title="'Tags'">
              <TagPicker
                class="mt-3 mb-3"
                v-if="tagsData && tagsData"
                v-model="selectedTags"
                :tag-options="getTagOptionLabels(tagsData.tags)"
                :selected-tags="selectedTags"
              />
            </FormRow>
          </div>
        </div>
      </div>

      <div class="pt-5">
        <div class="flex justify-end">
          <CancelButton />
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