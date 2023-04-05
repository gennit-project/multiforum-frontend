<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  useMutation,
  useQuery,
  provideApolloClient,
} from "@vue/apollo-composable";
import { gql } from "@apollo/client/core";
import { apolloClient } from "@/main";
import { CREATE_DISCUSSION } from "@/graphQLData/discussion/mutations";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { DiscussionData } from "@/types/discussionTypes";
import CreateEditDiscussionFields from "./CreateEditDiscussionFields.vue";
import { CreateEditDiscussionFormValues } from "@/types/discussionTypes";
import RequireAuth from "../auth/RequireAuth.vue";
import "md-editor-v3/lib/style.css";

export default defineComponent({
  name: "CreateDiscussion",
  components: {
    CreateEditDiscussionFields,
    RequireAuth
  },
  apollo: {},
  setup() {
    provideApolloClient(apolloClient);

    const { result: localUsernameResult } = useQuery(GET_LOCAL_USERNAME);

    const username = computed(() => {
      let username = localUsernameResult.value?.username;
      if (username) {
        return username;
      }
      return "";
    });

    const route = useRoute();
    const router = useRouter();

    const channelId: string = `${
      route.params.channelId ? route.params.channelId : ""
    }`;

    const createDiscussionDefaultValues: CreateEditDiscussionFormValues = {
      title: "",
      body: "",
      selectedChannels: channelId ? [channelId] : [],
      selectedTags: [],
    };

    const formValues = ref(createDiscussionDefaultValues);

    const createDiscussionInput = computed(() => {
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

      const channelConnections = formValues.value.selectedChannels.map(
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

      const input = {
        title: formValues.value.title || null,
        body: formValues.value.body || null,
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
                username: username.value,
              },
            },
          },
        },
      };
      return [input];
    });

    const {
      mutate: createDiscussion,
      error: createDiscussionError,
      onDone,
    } = useMutation(CREATE_DISCUSSION, () => ({
      errorPolicy: "all",
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
            channelId: formValues.value.selectedChannels[0],
            discussionId: newDiscussionId,
          },
        });
      }
    });

    return {
      channelId,
      createDiscussion,
      createDiscussionError,
      createDiscussionInput,
      formValues,
      router,
      username
    };
  },

  methods: {
    async submit() {
      if (!this.username){
        console.error("No username found")
        return
      }
      this.createDiscussion();
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
  <RequireAuth>
    <template v-slot:has-auth>
      <CreateEditDiscussionFields
        :create-discussion-error="createDiscussionError"
        :edit-mode="false"
        :form-values="formValues"
        @submit="submit"
        @updateFormValues="updateFormValues"
      />
    </template>
    <template v-slot:does-not-have-auth>
      <div class="p-8 flex justify-center">
        You don't have permission to see this page.
      </div>
    </template>
  </RequireAuth>
</template>

<style>
</style>