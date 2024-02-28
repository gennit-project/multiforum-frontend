<script lang="ts">
import { useRoute } from "vue-router";
import { defineComponent, computed, ref } from "vue";
import { useDisplay } from "vuetify";
import SubredditContent from "@/components/subreddit/SubredditContent.vue";
import {
  GET_SUBREDDIT_SIDEBAR,
  GET_SUBREDDIT_POSTS,
} from "@/graphQLData/subreddit/queries";
import { useQuery } from "@vue/apollo-composable";
import { router } from "@/router";
import gql from "graphql-tag";
import SubredditPostList from "@/components/subreddit/SubredditPostList.vue";
import ChannelHeaderMobile from "@/components/channel/ChannelHeaderMobile.vue";
import ChannelHeaderDesktop from "@/components/channel/ChannelHeaderDesktop.vue";
import FlairList from "@/components/subreddit/FlairList.vue";

// const channel = {
//         channelBannerURL,
//         channelIconURL,
//         displayName,
//         uniqueName
//     }

export default defineComponent({
  name: "SubredditComponent",
  components: {
    ChannelHeaderMobile,
    ChannelHeaderDesktop,
    FlairList,
    SubredditContent,
    SubredditPostList,
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

    const subredditName = computed(() => {
      if (typeof route.value.params.subredditName !== "string") {
        return "";
      }
      return route.value.params.subredditName;
    });

    const {
      error: getSubredditSidebarError,
      result: getSubredditSidebarResult,
    } = useQuery(GET_SUBREDDIT_SIDEBAR, {
      subredditName: subredditName,
    });

    const {
      error: getSubredditPostsError,
      result: getSubredditPostsResult,
      loading: getSubredditPostsLoading,
    } = useQuery(GET_SUBREDDIT_POSTS, {
      subredditName: subredditName,
    });

    const subredditSidebar = computed(() => {
      if (!getSubredditSidebarResult.value || getSubredditSidebarError.value) {
        return null;
      }
      const sidebar = getSubredditSidebarResult.value.getSubredditSidebar;
      return sidebar;
    });

    const linkFlairs = computed(() => {
      if (!subredditSidebar.value) {
        return [];
      }
      return subredditSidebar.value.linkFlairs;
    });

    const { lgAndDown, lgAndUp, mdAndUp, mdAndDown, smAndDown } = useDisplay();

    const channel = computed(() => {
      if (getSubredditSidebarError.value || getSubredditPostsError.value) {
        return null;
      }
      return {
        channelBannerURL: subredditSidebar.value?.bannerImg || "",
        channelIconURL: subredditSidebar.value?.communityIcon || "",
        displayName: subredditSidebar.value?.displayName || "",
        uniqueName: subredditName.value,
      };
    });

    return {
      channel,
      getSubredditPostsError,
      getSubredditPostsLoading,
      getSubredditPostsResult,
      lgAndDown,
      linkFlairs,
      leftColumnIsExpanded: ref(true),
      mdAndDown,
      lgAndUp,
      mdAndUp,
      route,
      router,
      showMenu: ref(false),
      smAndDown,
      subredditName,
      subredditSidebar,
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
  <div class="h-screen flex-col justify-center dark:bg-black">
    <ChannelHeaderMobile
      v-if="smAndDown && channel"
      :channel="channel"
      :channel-id="subredditName"
      :show-create-button="false"
    />
    <div
      v-if="smAndDown"
      class="w-full bg-gray-100 flex-col pt-8"
    >
      <SubredditContent
        v-if="channel"
        :channel-id="subredditName"
        :channel="channel"
      >
        <FlairList :flairs="linkFlairs" />
        <SubredditPostList :compact="true" />
      </SubredditContent>
    </div>

    <article
      v-if="!smAndDown && channel"
      class="w-full bg-gray-100"
    >
      <ChannelHeaderDesktop
        v-if="channel"
        :channel="channel"
        :channel-id="subredditName"
        :admin-list="[]"
        :route="route"
        :show-create-button="false"
      />
      <SubredditContent
        v-if="channel"
        :channel-id="subredditName"
        :channel="channel"
      >
        <FlairList :flairs="linkFlairs" />
        <SubredditPostList />
      </SubredditContent>
    </article>
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
