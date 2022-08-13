<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ChannelData, CreateEditChannelFormValues } from "@/types/channelTypes";
import { CREATE_CHANNEL } from "@/graphQLData/channel/mutations";
import {
  useMutation,
  provideApolloClient,
} from "@vue/apollo-composable";
import { gql } from "@apollo/client/core";
import { apolloClient } from "@/main";
import CreateEditChannelFields from "./CreateEditChannelFields.vue";

export default defineComponent({
  name: "CreateChannel",
  components: {
    CreateEditChannelFields
  },
  apollo: {},
  setup() {
    provideApolloClient(apolloClient);
    const route = useRoute();
    const router = useRouter();

    const channelId: string | string[] = route.params.channelId;

    const createChannelDefaultValues: CreateEditChannelFormValues = {
      uniqueName: "",
      description: "",
      selectedTags: [],
      username: "cluse"
    }
   
    const formValues = ref(createChannelDefaultValues)

    const createChannelInput = computed(() => {
      const tagConnections = formValues.value.selectedTags.map((tag: string) => {
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
          uniqueName: formValues.value.uniqueName,
          description: formValues.value.description,
          Tags: {
            connectOrCreate: tagConnections,
          },
          Admins: {
            connect: {
              where: {
                node: {
                  username: formValues.value.username,
                },
              },
            },
          },
        },
      ];
    });

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
      channelId,
      createChannel,
      createChannelError,
      createChannelInput,
      formValues,
      router,
    };
  },
  methods: {
    async submit() {
      this.createChannel();
    },
    updateFormValues(data: CreateEditChannelFormValues) {
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
  <CreateEditChannelFields
    :create-channel-error="createChannelError"
    :edit-mode="false"
    :form-values="formValues"
    @submit="submit"
    @updateFormValues="updateFormValues"
  />
</template>