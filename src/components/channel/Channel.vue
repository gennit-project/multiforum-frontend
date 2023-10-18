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

export default defineComponent({
  name: "ChannelComponent",
  components: {
    Avatar,
    ChannelSidebar,
    ChannelTabs,
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
    });

    const channel = computed(() => {
      if (getChannelLoading.value || getChannelError.value) {
        return null;
      }
      return getChannelResult.value.channels[0];
    });

    const discussionId = computed(() => {
      return route.value.params.discussionId;
    });

    const eventId = computed(() => {
      return route.value.params.eventId;
    });
    const { lgAndDown, lgAndUp, mdAndUp, mdAndDown, smAndDown } = useDisplay();

    return {
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
  <div class="justify-center overflow-hidden dark:bg-black">
    <div
      v-if="smAndDown"
      :class="[
        theme === 'dark' ? 'channel-background-dark' : 'channel-background',
      ]"
      class="h-16 w-full object-cover lg:h-28"
      alt="background pattern"
    />
    <div class="flex justify-center" v-if="smAndDown">
      <Avatar
        class="-mt-12 mb-2 h-24 w-24 shadow-sm"
        :text="channelId"
        :is-square="true"
        :is-large="true"
      />
    </div>
    <div class="dark:bg-gray-950">
      <article class="relative z-0 flex-1 focus:outline-none xl:order-last">
        <v-container fluid class="p-0 max-w-7xl bg-white dark:bg-gray-800">
          <ChannelTabs
            v-if="smAndDown"
            :vertical="false"
            class="block border-b border-gray-200 dark:border-gray-600"
            :route="route"
          />
          <v-row>
            <v-col 
              v-if="channelId && !smAndDown" 
              cols="12" 
              md="3" 
              class="p-0"
            >
              <ChannelSidebar :channel-id="channelId" class="h-full fixed w-64">
                <ChannelTabs
                  v-if="route.name !== 'EditChannel'"
                  :route="route"
                  :vertical="true"
                />
              </ChannelSidebar>
            </v-col>
            <v-col
              :class="[!smAndDown ? 'pt-6' : '']"
              :cols="channelId && !smAndDown ? 9 : 12"
            >
              <router-view />
            </v-col>
          </v-row>
        </v-container>
      </article>
    </div>
  </div>
</template>

<style>
#channelAvatar {
  background-color: #4474c0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='152' height='152' viewBox='0 0 152 152'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='temple' fill='%23efefef' fill-opacity='0.4'%3E%3Cpath d='M152 150v2H0v-2h28v-8H8v-20H0v-2h8V80h42v20h20v42H30v8h90v-8H80v-42h20V80h42v40h8V30h-8v40h-42V50H80V8h40V0h2v8h20v20h8V0h2v150zm-2 0v-28h-8v20h-20v8h28zM82 30v18h18V30H82zm20 18h20v20h18V30h-20V10H82v18h20v20zm0 2v18h18V50h-18zm20-22h18V10h-18v18zm-54 92v-18H50v18h18zm-20-18H28V82H10v38h20v20h38v-18H48v-20zm0-2V82H30v18h18zm-20 22H10v18h18v-18zm54 0v18h38v-20h20V82h-18v20h-20v20H82zm18-20H82v18h18v-18zm2-2h18V82h-18v18zm20 40v-18h18v18h-18zM30 0h-2v8H8v20H0v2h8v40h42V50h20V8H30V0zm20 48h18V30H50v18zm18-20H48v20H28v20H10V30h20V10h38v18zM30 50h18v18H30V50zm-2-40H10v18h18V10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
.channel-background {
  background-color: #faf9fc;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='152' height='152' viewBox='0 0 152 152'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='temple' fill='%23000000' fill-opacity='0.08'%3E%3Cpath d='M152 150v2H0v-2h28v-8H8v-20H0v-2h8V80h42v20h20v42H30v8h90v-8H80v-42h20V80h42v40h8V30h-8v40h-42V50H80V8h40V0h2v8h20v20h8V0h2v150zm-2 0v-28h-8v20h-20v8h28zM82 30v18h18V30H82zm20 18h20v20h18V30h-20V10H82v18h20v20zm0 2v18h18V50h-18zm20-22h18V10h-18v18zm-54 92v-18H50v18h18zm-20-18H28V82H10v38h20v20h38v-18H48v-20zm0-2V82H30v18h18zm-20 22H10v18h18v-18zm54 0v18h38v-20h20V82h-18v20h-20v20H82zm18-20H82v18h18v-18zm2-2h18V82h-18v18zm20 40v-18h18v18h-18zM30 0h-2v8H8v20H0v2h8v40h42V50h20V8H30V0zm20 48h18V30H50v18zm18-20H48v20H28v20H10V30h20V10h38v18zM30 50h18v18H30V50zm-2-40H10v18h18V10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
.channel-background-dark {
  background-color: #000000;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='152' height='152' viewBox='0 0 152 152'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='temple' fill='%23f9f9fb' fill-opacity='0.34'%3E%3Cpath d='M152 150v2H0v-2h28v-8H8v-20H0v-2h8V80h42v20h20v42H30v8h90v-8H80v-42h20V80h42v40h8V30h-8v40h-42V50H80V8h40V0h2v8h20v20h8V0h2v150zm-2 0v-28h-8v20h-20v8h28zM82 30v18h18V30H82zm20 18h20v20h18V30h-20V10H82v18h20v20zm0 2v18h18V50h-18zm20-22h18V10h-18v18zm-54 92v-18H50v18h18zm-20-18H28V82H10v38h20v20h38v-18H48v-20zm0-2V82H30v18h18zm-20 22H10v18h18v-18zm54 0v18h38v-20h20V82h-18v20h-20v20H82zm18-20H82v18h18v-18zm2-2h18V82h-18v18zm20 40v-18h18v18h-18zM30 0h-2v8H8v20H0v2h8v40h42V50h20V8H30V0zm20 48h18V30H50v18zm18-20H48v20H28v20H10V30h20V10h38v18zM30 50h18v18H30V50zm-2-40H10v18h18V10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>
