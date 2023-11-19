<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  useQuery,
  useMutation,
  provideApolloClient,
} from "@vue/apollo-composable";
import { TagData } from "@/types/tagTypes";
import { UserData } from "@/types/userTypes";
import { GET_CHANNEL } from "@/graphQLData/channel/queries";
import { UPDATE_CHANNEL } from "@/graphQLData/channel/mutations";
import { apolloClient } from "@/main";
import { CreateEditChannelFormValues } from "@/types/channelTypes";
import CreateEditChannelFields from "./CreateEditChannelFields.vue";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import RequireAuth from "@/components/auth/RequireAuth.vue";
import {
  ChannelTagsConnectOrCreateFieldInput,
  ChannelTagsDisconnectFieldInput,
  ChannelUpdateInput,
} from "@/__generated__/graphql";
import Notification from '@/components/generic/Notification.vue'

export default defineComponent({
  name: "EditChannel",
  components: {
    CreateEditChannelFields,
    Notification,
    RequireAuth,
  },
  apollo: {},
  setup() {
    provideApolloClient(apolloClient);
    const route = useRoute();
    const router = useRouter();

    const { result: localUsernameResult } = useQuery(GET_LOCAL_USERNAME);

    const channelId: string | string[] = route.params.channelId;

    const {
      error: getChannelError,
      result: getChannelResult,
      onResult: onGetChannelResult,
      loading: getChannelLoading,
    } = useQuery(GET_CHANNEL, {
      uniqueName: channelId,
    });

    const channel = computed(() => {
      if (getChannelLoading.value || getChannelError.value) {
        return null;
      }
      return getChannelResult.value.channels[0];
    });

    const existingTags = computed(() => {
      if (!channel.value || !channel.value.Tags) {
        return [];
      }
      return channel.value.Tags.map((tag: TagData) => {
        return tag.text;
      });
    });

    const getDefaultChannelValues = () => {
      if (channel.value) {
        return {
          uniqueName: channel.value.uniqueName,
          displayName: channel.value.displayName,
          description: channel.value.description,
          selectedTags: channel.value.Tags.map((tag: TagData) => {
            return tag.text;
          }),
          channelIconURL: channel.value.channelIconURL,
          channelBannerURL: channel.value.channelBannerURL,
        };
      }

      return {
        uniqueName: "",
        displayName: "",
        description: "",
        selectedTags: [],
        channelIconURL: "",
        channelBannerURL: "",
      };
    };

    const formValues = ref<CreateEditChannelFormValues>(
      getDefaultChannelValues(),
    );

    const username = computed(() => {
      return localUsernameResult.value.username;
    });

    const ownerList = computed(() => {
      if (channel.value && channel.value.Admins) {
        return channel.value.Admins.map((admin: UserData) => {
          return admin.username;
        });
      }
      return [];
    });

    const dataLoaded = ref(false);

    onGetChannelResult((value) => {
      if (value.loading) {
        return;
      }

      const channel = value.data.channels[0];

      formValues.value = {
        uniqueName: channel.uniqueName,
        description: channel.description,
        displayName: channel.displayName,
        selectedTags: channel.Tags.map((tag: TagData) => {
          return tag.text;
        }),
        channelIconURL: channel.channelIconURL,
        channelBannerURL: channel.channelBannerURL,
      };

      dataLoaded.value = true;
    });

    const channelUpdateInput = computed(() => {
      const tagConnections: ChannelTagsConnectOrCreateFieldInput[] =
        formValues.value.selectedTags.map((tag: string) => {
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

      const tagDisconnections: ChannelTagsDisconnectFieldInput[] =
        existingTags.value
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

      const result: ChannelUpdateInput = {
        description: formValues.value.description,
        displayName: formValues.value.displayName,
        channelIconURL: formValues.value.channelIconURL,
        channelBannerURL: formValues.value.channelBannerURL,
        Tags: [
          {
            connectOrCreate: tagConnections,
            disconnect: tagDisconnections,
          },
        ],
        Admins: [
          {
            connect: [
              {
                where: {
                  node: {
                    username: username.value,
                  },
                },
              },
            ],
          },
        ],
      };
      return result;
    });

    const showSavedChangesNotification = ref(false);

    const {
      mutate: updateChannel,
      error: updateChannelError,
      onDone,
    } = useMutation(UPDATE_CHANNEL);

    onDone(() => {
      showSavedChangesNotification.value = true;
    });

    return {
      channelId,
      channelUpdateInput,
      existingTags,
      formValues,
      dataLoaded,
      getChannelError,
      getChannelLoading,
      getChannelResult,
      ownerList,
      router,
      updateChannelError,
      updateChannel,
      showSavedChangesNotification
    };
  },
  methods: {
    async submit() {
      this.updateChannel({
        where: {
          uniqueName: this.channelId,
        },
        update: this.channelUpdateInput,
      });
    },
    updateFormValues(data: CreateEditChannelFormValues) {
      // Update all form values at once because it makes cleaner
      // code than passing each form individual value as a prop
      // or writing separate methods to update each value.
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
  <RequireAuth
    :require-ownership="true"
    :owners="ownerList"
  >
    <template #has-auth>
      <CreateEditChannelFields
        :key="dataLoaded.toString()"
        :edit-mode="true"
        :channel-loading="getChannelLoading"
        :get-channel-error="getChannelError"
        :update-channel-error="updateChannelError"
        :form-values="formValues"
        :owner-list="ownerList"
        @submit="submit"
        @updateFormValues="updateFormValues"
      />
      <Notification
        v-if="showSavedChangesNotification"
        :title="'Your changes have been saved.'"
        @closeNotification="showSavedChangesNotification = false"
      />
    </template>
    <template #does-not-have-auth>
      <div class="p-8">
        You don't have permission to see this page.
      </div>
    </template>
  </RequireAuth>
</template>

<style></style>
