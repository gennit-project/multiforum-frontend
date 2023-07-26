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

export default defineComponent({
  name: "EditChannel",
  components: {
    CreateEditChannelFields,
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
          description: channel.value.description,
          selectedTags: channel.value.Tags.map((tag: TagData) => {
            return tag.text;
          }),
        };
      }

      return {
        uniqueName: "",
        description: "",
        selectedTags: [],
      };
    };

    const formValues = ref<CreateEditChannelFormValues>(
      getDefaultChannelValues()
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
      return []
    })

    const dataLoaded = ref(false); 

    onGetChannelResult((value) => {
      if (value.loading) {
        return;
      }
      
      const channel = value.data.channels[0];

      formValues.value = {
        uniqueName: channel.uniqueName,
        description: channel.description,
        selectedTags: channel.Tags.map((tag: TagData) => {
          return tag.text;
        }),
      };

      dataLoaded.value = true;
    });

    const channelUpdateInput = computed(() => {
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

      return {
        description: formValues.value.description,
        Tags: {
          connectOrCreate: tagConnections,
          disconnect: tagDisconnections,
        },
        Admins: {
          connect: {
            where: {
              node: {
                username: username.value,
              },
            },
          },
        },
      };
    });

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
        name: "SearchDiscussionsInChannel",
        params: {
          channelId: channelId,
        },
      });
    });

    return {
      channelId,
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
    };
  },
  methods: {
    async submit() {
      this.updateChannel();
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
  <RequireAuth :require-ownership="true" :owners="ownerList">
    <template v-slot:has-auth>
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
    </template>
    <template v-slot:does-not-have-auth>
      <div class="p-8">
        You don't have permission to see this page.
      </div>
    </template>
  </RequireAuth>
</template>

<style>
</style>