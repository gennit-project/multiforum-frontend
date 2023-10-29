<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  useMutation,
  useQuery,
  provideApolloClient,
} from "@vue/apollo-composable";
import { DISCUSSION_PAGE_LIMIT } from "@/components/discussion/list/ChannelDiscussionList.vue";
import { apolloClient } from "@/main";
import { CREATE_DISCUSSION_WITH_CHANNEL_CONNECTIONS } from "@/graphQLData/discussion/mutations";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { DiscussionData } from "@/types/discussionTypes";
import CreateEditDiscussionFields from "./CreateEditDiscussionFields.vue";
import { CreateEditDiscussionFormValues } from "@/types/discussionTypes";
import RequireAuth from "../../auth/RequireAuth.vue";
import { DiscussionCreateInput } from "@/__generated__/graphql";
import "md-editor-v3/lib/style.css";
import { GET_COMMENT_SECTION } from "@/graphQLData/comment/queries";
import gql from "graphql-tag";

export default defineComponent({
  name: "CreateDiscussion",
  components: {
    CreateEditDiscussionFields,
    RequireAuth,
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
      author: username.value,
    };

    const formValues = ref(createDiscussionDefaultValues);

    const discussionCreateInput = computed<DiscussionCreateInput>(() => {
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
        },
      );

      const input = {
        title: formValues.value.title,
        body: formValues.value.body,
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

      return input;
    });

    const channelConnections = computed(() => {
      return formValues.value.selectedChannels;
    });

    const createDiscussionLoading = ref(false)

    const {
      mutate: createDiscussion,
      error: createDiscussionError,
      onDone,
    } = useMutation(CREATE_DISCUSSION_WITH_CHANNEL_CONNECTIONS, () => ({
      errorPolicy: "all",
      variables: {
        discussionCreateInput: discussionCreateInput.value,
        channelConnections: channelConnections.value,
      },
      update: (cache: any, result: any) => {
        const newDiscussion: DiscussionData =
          result.data?.createDiscussionWithChannelConnections;

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
                  (ref: any) => readField("id", ref) === newDiscussion.id,
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
    console.log('create discussion in original mutation ', createDiscussionLoading)

    onDone((response: any) => {
      const newDiscussionId =
        response.data?.createDiscussionWithChannelConnections.id;

      /*
        If the discussion was created in the context
        of a channel, redirect to the discussion detail page in
        the channel.
      */
     createDiscussionLoading.value = false

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
      createDiscussionLoading,
      formValues,
      router,
      username,
    };
  },

  methods: {
    async submit() {
      if (!this.username) {
        console.error("No username found");
        return;
      }
      this.createDiscussionLoading = true;
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
    <template #has-auth>
      <CreateEditDiscussionFields
        :create-discussion-error="createDiscussionError"
        :create-discussion-loading="createDiscussionLoading"
        :edit-mode="false"
        :form-values="formValues"
        @submit="submit"
        @updateFormValues="updateFormValues"
      />
    </template>
    <template #does-not-have-auth>
      <div class="flex justify-center p-8">
        You don't have permission to see this page.
      </div>
    </template>
  </RequireAuth>
</template>

<style></style>
