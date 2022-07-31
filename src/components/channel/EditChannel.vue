<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  useQuery,
  useMutation,
  useResult,
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
import ErrorBanner from "../forms/ErrorBanner.vue";
import { GET_CHANNEL } from "@/graphQLData/channel/queries";
import { apolloClient } from "@/main";
import { ChannelData } from "@/types/channelTypes";

export default defineComponent({
  name: "CreateChannel",
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

    const { result, loading: channelLoading } = useQuery(GET_CHANNEL, {
      uniqueName: channelId,
    });

    const existingDescription = useResult(result, "", (data: any) => {
      return data.channels[0]?.description;
    });

    const existingTags = useResult(result, [], (data: any) => {
      if (data.channels[0]?.Tags) {
        return data.channels[0].Tags.map((tag: TagData) => {
          return tag.text;
        });
      }
      return [];
    });

    const uniqueName = ref(
      channelId && typeof channelId === "string" ? channelId : ""
    );
    const description = ref(existingDescription.value);
    const selectedTags = ref(existingTags.value);

    const username = "cluse";

    watch(result, (value) => {
      const channelData = value.channels[0];

      if (channelData) {
        description.value = channelData.description;
        selectedTags.value = channelData.Tags.map((tag: TagData) => {
          return tag.text;
        });
      }
    });

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

    const channelUpdateInput = computed(() => {
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

      return {
        description: description.value,
        Tags: {
          connectOrCreate: tagConnections,
          disconnect: tagDisconnections,
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
      };
    });

    const UPDATE_CHANNEL = gql`
      mutation updateChannel(
        $where: ChannelWhere
        $update: ChannelUpdateInput
      ) {
        updateChannels(where: $where, update: $update) {
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
      mutate: updateChannel,
      error: updateChannelError,
      onDone,
    } = useMutation(UPDATE_CHANNEL, () => ({
      variables: {
        where: {
          uniqueName: channelId,
        },
        update: channelUpdateInput.value,
      },
    }));

    onDone((response: any) => {
      const channelId = response.data.updateChannels.channels[0].uniqueName;

      router.push({
        name: "Channel",
        params: {
          channelId: channelId,
        },
      });
    });

    return {
      channelId,
      updateChannelError,
      channelLoading,
      updateChannel,
      description,
      existingDescription,
      existingTags,
      router,
      selectedTags,
      tagsData,
      tagsLoading,
      tagsError,
      uniqueName,
      username,
    };
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
    updateChannelName(updated: string) {
      this.uniqueName = updated;
    },
    setSelectedTags(updated: string[]) {
      this.selectedTags = updated;
    },
    async submit() {
      this.updateChannel();
    },
    cancel() {
      this.router.push({
        name: "Channel",
        params: {
          channelId: this.channelId,
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
        class="mt-2"
        v-if="updateChannelError"
        :text="updateChannelError.message"
      />
      <div v-if="channelLoading || tagsLoading">Loading...</div>

      <div v-else class="space-y-8 divide-y divide-gray-200 sm:space-y-5">
        <div>
          <FormTitle v-if="channelId">Edit Channel</FormTitle>
          <FormTitle v-else>Create Channel</FormTitle>

          <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
            <FormRow :section-title="'Unique Name'">
              <TextInput
                :initial-value="uniqueName"
                :full-width="true"
                :disabled="true"
                @update="updateChannelName"
              />
            </FormRow>

            <FormRow :section-title="'Description'">
              <TextEditor
                class="mb-3"
                :initial-value="existingDescription"
                @update="updateDescription"
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
          <SaveButton @click.prevent="submit" />
        </div>
      </div>
    </Form>
  </div>
</template>

<style>
</style>