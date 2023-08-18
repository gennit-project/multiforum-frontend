<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_CHANNEL } from "@/graphQLData/channel/queries";
import { useRoute, useRouter } from "vue-router";
import Tag from "@/components/tag/Tag.vue";
import RequireAuth from "../auth/RequireAuth.vue";
import "md-editor-v3/lib/style.css";
import { useDisplay } from "vuetify";
import Avatar from "../user/Avatar.vue";
import gql from "graphql-tag";

export default defineComponent({
  name: "AboutPage",
  components: {
    RequireAuth,
    Tag,
    Avatar,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    const {
      error: getChannelError,
      result: getChannelResult,
      loading: getChannelLoading,
    } = useQuery(GET_CHANNEL, {
      uniqueName: channelId.value,
    });

    const channel = computed(() => {
      if (getChannelLoading.value || getChannelError.value) {
        return null;
      }
      return getChannelResult.value.channels[0];
    });

    const tags = computed(() => {
      if (channel.value) {
        return channel.value.Tags;
      }
      return [];
    });

    const admins = computed(() => {
      if (channel.value) {
        return channel.value.Admins;
      }
      return [];
    });

    const ownerList = computed(() => {
      // Used to determine whether the logged in
      // user should be able to see the buttons for
      // admin actions
      return admins.value.map((adminData: any) => adminData.username);
    });

    const { mdAndDown } = useDisplay();
    const GET_THEME = gql`
      query getTheme {
        theme @client
      }
    `;

    const {
      result: themeResult,
      loading: themeLoading,
      error: themeError,
    } = useQuery(GET_THEME);

    const theme = computed(() => {
      if (themeLoading.value || themeError.value) {
        return "";
      }
      return themeResult.value.theme;
    });

    return {
      admins,
      channel,
      channelId,
      confirmDeleteIsOpen: ref(false),
      getChannelLoading,
      getChannelError,
      mdAndDown,
      ownerList,
      router,
      tags,
      theme,
    };
  },

  methods: {
    filterChannelsByTag(tag: string) {
      this.router.push({
        name: "FilterChannelsByTag",
        params: {
          tag,
        },
      });
    },
  },
});
</script>

<template>
  <div class="h-screen overflow-y-auto border-r-2 dark:border-gray-600">
    <div
      v-if="channelId"
      class="mt-6 mb-4 flex gap-2 items-center px-4"
    >
      <Avatar
        :text="channelId"
        :is-square="true"
      />
      <h1
        v-if="channelId"
        class="my-2 mb-2 flex justify-center border-gray-700 text-xl font-bold leading-6 text-gray-500 dark:text-gray-300"
      >
        {{ channelId }}
      </h1>
    </div>

    <div class="w-full">
      <p v-if="getChannelLoading">
        Loading...
      </p>
      <div v-else-if="getChannelError">
        <div
          v-for="(error, i) of getChannelError?.graphQLErrors"
          :key="i"
        >
          {{ error.message }}
        </div>
      </div>
      <div v-else-if="channel">
        <div
          class="w-full px-4"
        >
          <div
            v-if="channel.description"
            class="text-sm text-gray-600 px-2 my-2"
          >
            {{ channel.description }}
          </div>
          <p
            v-else
            class="text-sm"
          >
            {{ "This channel has no description." }}
          </p>
        </div>
        <slot />

        <div class="w-full mt-6">
          <div v-if="channel.Tags.length > 0">
            <div class="flex justify-between border-gray-300">
              <span
                class="my-2 mb-2 px-6 text-sm font-bold leading-6 text-gray-500 dark:text-gray-300"
              >
                Tags
              </span>
            </div>

            <div class="mb-6 mt-2 flex flex-wrap px-6">
              <Tag
                v-for="tag in channel.Tags"
                :key="tag.text"
                class="mb-1"
                :tag="tag.text"
                @click="filterChannelsByTag(tag.text)"
              />
            </div>
          </div>
          <div class="flex justify-between">
            <span
              class="my-2 mb-2 px-6 text-sm font-bold leading-6 text-gray-500 dark:text-gray-300"
            >
              Admins
            </span>
          </div>
          <ul
            v-if="channel.Admins.length > 0"
            class="my-3 px-5 text-sm font-bold"
          >
            <li
              v-for="admin in channel.Admins"
              :key="admin.username"
            >
              <router-link
                :key="admin.username"
                :to="`/u/${admin.username}`"
                class="flex items-center"
              >
                <Avatar
                  :text="admin.username"
                  class="mr-2"
                />
                {{ admin.username }}
              </router-link>
            </li>
          </ul>
          <p
            v-else
            class="mx-6 my-3 mb-6 text-sm"
          >
            This channel does not have any admins.
          </p>
        </div>
      </div>
      <RequireAuth
        :require-ownership="true"
        :owners="ownerList"
        :justify-left="true"
        class="w-full"
      >
        <template #has-auth>
          <div class="flex w-full justify-between border-gray-500">
            <span
              class="my-2 mb-2 w-full px-6 text-sm font-bold leading-6 text-gray-500 dark:text-gray-300"
            >
              Admin Actions
            </span>
          </div>
          <router-link
            class="my-3 px-6 text-sm underline"
            :to="`/channels/c/${channelId}/edit`"
          >
            Edit
          </router-link>
        </template>
      </RequireAuth>
    </div>
  </div>
</template>
<style lang="scss" scoped>
/* Apply the user's preferred color scheme by default */
@media (prefers-color-scheme: dark) {
  #md-editor-v3-preview,
  #md-editor-v3-preview-wrapper {
    background-color: black;
  }
}

@media (prefers-color-scheme: light) {
  #md-editor-v3-preview,
  #md-editor-v3-preview-wrapper {
    background-color: blue;
  }
}
</style>
