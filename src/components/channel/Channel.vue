<script lang="ts">
import ChannelTabs from "./ChannelTabs.vue";
import { useRoute } from "vue-router";
import { defineComponent, computed, ref } from "vue";
import { useDisplay } from "vuetify";
import ChannelSidebar from "@/components/channel/ChannelSidebar.vue";
import { GET_CHANNEL } from "@/graphQLData/channel/queries";
import { useQuery } from "@vue/apollo-composable";
import { router } from "@/router";
import gql from "graphql-tag";
import Avatar from "@/components/user/Avatar.vue";
import { User } from "@/__generated__/graphql";
import ExpandableImage from "../generic/ExpandableImage.vue";
import MarkdownPreview from "@/components/generic/forms/MarkdownPreview.vue";
import CreateAnythingButton from "../nav/CreateAnythingButton.vue";

export default defineComponent({
  name: "ChannelComponent",
  components: {
    Avatar,
    ChannelSidebar,
    CreateAnythingButton,
    ChannelTabs,
    ExpandableImage,
    MarkdownPreview,
  },
  setup() {
    const route = ref(useRoute());
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

    const channelId = computed(() => {
      if (typeof route.value.params.channelId !== "string") {
        return "";
      }
      return route.value.params.channelId;
    });

    const {
      error: getChannelError,
      result: getChannelResult,
      loading: getChannelLoading,
    } = useQuery(GET_CHANNEL, {
      uniqueName: channelId,
      now: new Date().toISOString(),
    });

    const channel = computed(() => {
      if (getChannelLoading.value || getChannelError.value) {
        return null;
      }
      const channel = getChannelResult.value.channels[0];
      return channel;
    });

    const discussionId = computed(() => {
      return route.value.params.discussionId;
    });

    const eventId = computed(() => {
      return route.value.params.eventId;
    });

    const adminList = computed(() => {
      if (!channel.value) {
        return [];
      }
      return channel.value.Admins.map((user: User) => {
        return user.username;
      });
    });
    const { lgAndDown, lgAndUp, mdAndUp, mdAndDown, smAndDown } = useDisplay();

    return {
      adminList,
      channel,
      channelId,
      discussionId,
      eventId,
      route,
      lgAndDown,
      leftColumnIsExpanded: ref(true),
      mdAndDown,
      lgAndUp,
      mdAndUp,
      router,
      showMenu: ref(false),
      smAndDown,
      theme,
    };
  },
  created() {
    this.$watch("$route", (newRoute: any) => {
      this.route = newRoute;
    });
  },
});
</script>

<template>
  <div class="flex h-screen justify-center dark:bg-black">
    <div v-if="smAndDown" class="w-full">
      <ExpandableImage
        v-if="channel?.channelBannerURL"
        :src="channel?.channelBannerURL"
        :alt="'channel banner'"
        :is-medium="true"
        :is-square="true"
        class="w-full"
      />
      <div class="flex items-center gap-4 bg-black">
        <Avatar
          class="mb-2 ml-3 mt-2 border-4 border-white dark:border-gray-800 md:ml-6"
          :text="channelId"
          :src="channel?.channelIconURL"
          :is-medium="true"
          :is-square="false"
        />
        <div v-if="channel?.displayName && channel?.uniqueName">
          <div>
            <h1
              v-if="channel?.displayName"
              class="flex border-gray-700 text-2xl font-bold leading-6 text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
            >
              {{ channel.displayName }}
            </h1>
          </div>
          <h2
            class="text-sm font-bold leading-6 text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
          >
            {{ `${channel.uniqueName}` }}
          </h2>
        </div>
        <div v-else>
          <h1
            class="flex border-gray-700 text-2xl font-bold leading-6 text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
          >
            {{ channelId }}
          </h1>
        </div>
      </div>
      <article
        class="relative z-0 h-full max-w-7xl rounded-lg bg-white focus:outline-none dark:bg-black xl:order-last"
      >
        <ChannelTabs
          v-if="channel && smAndDown"
          class="block w-full border-b border-gray-200 px-3 dark:border-gray-600 md:px-6"
          :vertical="false"
          :show-counts="true"
          :admin-list="adminList"
          :route="route"
          :channel="channel"
        />
        <div>
          <router-view />
        </div>
      </article>
    </div>

    <article v-if="!smAndDown" class="w-full">
      <ExpandableImage
        v-if="channel?.channelBannerURL"
        :src="channel?.channelBannerURL"
        :alt="'channel banner'"
        :is-square="true"
        class="my-2 max-h-40 w-full"
      />

      <v-container
        fluid
        class="relative z-0 max-w-6xl flex-1 focus:outline-none xl:order-last"
      >
        <div class="align-items flex-col gap-2">
          <div
            class="mb-6 flex justify-between"
            :class="[channel?.channelBannerURL ? '-mt-16' : '']"
          >
            <div class="align-items flex gap-4">
              <ExpandableImage
                v-if="channel?.channelIconURL"
                class="h-36 w-36 border-2 shadow-sm dark:border-gray-800"
                :is-square="false"
                :is-medium="true"
                :alt="channelId"
                :src="channel?.channelIconURL ?? ''"
              />
              <Avatar
                v-else
                class="h-36 w-36 border-2 shadow-sm dark:border-gray-800"
                :text="channelId"
                :src="channel?.channelIconURL ?? ''"
                :is-medium="true"
                :is-square="false"
              />
              <div class="flex flex-col">
                <h1
                  v-if="channelId"
                  :class="[channel?.channelBannerURL ? 'mt-20' : 'mt-16']"
                  class="flex border-gray-700 text-3xl font-bold leading-6 text-black dark:text-gray-200"
                >
                  {{ channel?.displayName ? channel.displayName : channelId }}
                </h1>
                <h2
                  v-if="channel?.uniqueName && channel?.displayName"
                  class="font-bold leading-6 text-gray-500 dark:text-gray-200"
                >
                  {{ `${channel.displayName}` }}
                </h2>
              </div>
            </div>
            <CreateAnythingButton
              class="mb-4 mt-20"
              :use-primary-button="true"
            />
          </div>
        </div>
        <v-row class="flex pt-0">
          <v-col :cols="8" class="pt-0">
            <router-view />
          </v-col>
          <v-col v-if="channelId" :cols="4" class="pt-0">
            <ChannelSidebar
              v-if="channel"
              :channel="channel"
              class="sticky top-0 overflow-auto"
            >
              <div>
                <MarkdownPreview
                  v-if="channel?.description"
                  :text="channel?.description"
                  :word-limit="1000"
                />
              </div>
              <ChannelTabs
                :route="route"
                :vertical="true"
                :show-counts="true"
                :channel="channel"
                :admin-list="adminList"
              />
            </ChannelSidebar>
          </v-col>
        </v-row>
      </v-container>
    </article>
  </div>
</template>

<style>
#channelAvatar {
  background-color: #4474c0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='152' height='152' viewBox='0 0 152 152'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='temple' fill='%23efefef' fill-opacity='0.4'%3E%3Cpath d='M152 150v2H0v-2h28v-8H8v-20H0v-2h8V80h42v20h20v42H30v8h90v-8H80v-42h20V80h42v40h8V30h-8v40h-42V50H80V8h40V0h2v8h20v20h8V0h2v150zm-2 0v-28h-8v20h-20v8h28zM82 30v18h18V30H82zm20 18h20v20h18V30h-20V10H82v18h20v20zm0 2v18h18V50h-18zm20-22h18V10h-18v18zm-54 92v-18H50v18h18zm-20-18H28V82H10v38h20v20h38v-18H48v-20zm0-2V82H30v18h18zm-20 22H10v18h18v-18zm54 0v18h38v-20h20V82h-18v20h-20v20H82zm18-20H82v18h18v-18zm2-2h18V82h-18v18zm20 40v-18h18v18h-18zM30 0h-2v8H8v20H0v2h8v40h42V50h20V8H30V0zm20 48h18V30H50v18zm18-20H48v20H28v20H10V30h20V10h38v18zM30 50h18v18H30V50zm-2-40H10v18h18V10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>
