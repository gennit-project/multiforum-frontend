<script lang="ts">
import ChannelTabs from "./ChannelTabs.vue";
// import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import { useRoute } from "vue-router";
import { defineComponent, computed, ref } from "vue";
import { useDisplay } from "vuetify";
import AboutColumn from "./AboutColumn.vue";
import { GET_CHANNEL } from "@/graphQLData/channel/queries";
import { useQuery } from "@vue/apollo-composable";
import MdEditor from "md-editor-v3";

export default defineComponent({
  name: "ChannelComponent",
  components: {
    AboutColumn,
    // ChannelIcon,
    ChannelTabs,
    MdEditor,
  },
  setup() {
    const route = ref(useRoute());

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
    const { lgAndDown, lgAndUp, mdAndUp, mdAndDown } = useDisplay();

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
  <div class="h-screen dark:bg-black">
    <div class="h-full">
      <article
        class="relative z-0 flex-1  focus:outline-none xl:order-last h-full"
      >
        <div class="block p-2 h-full">
          <div class="flex flex-col lg:flex-row h-full">
            
            <div class="h-full flex-grow lg:ml-4">
              <div
                class="border rounded-t-md dark:border-gray-800 dark:bg-gray-950"
                v-if="route.name !== 'EditChannel'"
              >
                <div class="px-4 sm:px-6 lg:px-8">
                  <div class="block pt-1 ">
                    <ChannelTabs class="block" :route="route" />
                  </div>
                </div>
              </div>
              <div class="bg-white border dark:border-gray-800 rounded-b-lg dark:bg-gray-950">
                <router-view></router-view>
              </div>
            </div>

            <div v-if="!mdAndDown" class="h-full dark:bg-gray-900">
              <AboutColumn
                v-if="leftColumnIsExpanded"
                @closeLeftColumn="leftColumnIsExpanded = false"
              />
                
              <div v-else>
                <button @click="leftColumnIsExpanded = true" class="p-2">
                  <!-- This is a simple left arrow SVG icon, indicating the expand action. -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    class="ml-4 w-6 h-6 text-gray-500"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
            <div
              v-else
              :class="mdAndDown ? '' : 'giveSpaceForLeftSideBar'"
              class="flex-grow pt-8 items-center bg-white dark:bg-gray-700 rounded-sm"
            >
              <md-editor
                v-if="channel && channel.description"
                v-model="channel.description"
                language="en-US"
                previewTheme="vuepress"
                preview-only
              />
              <AboutColumn v-if="mdAndUp" />
            </div>

          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style>
#channelAvatar {
  background-color: #4474c0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='152' height='152' viewBox='0 0 152 152'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='temple' fill='%23efefef' fill-opacity='0.4'%3E%3Cpath d='M152 150v2H0v-2h28v-8H8v-20H0v-2h8V80h42v20h20v42H30v8h90v-8H80v-42h20V80h42v40h8V30h-8v40h-42V50H80V8h40V0h2v8h20v20h8V0h2v150zm-2 0v-28h-8v20h-20v8h28zM82 30v18h18V30H82zm20 18h20v20h18V30h-20V10H82v18h20v20zm0 2v18h18V50h-18zm20-22h18V10h-18v18zm-54 92v-18H50v18h18zm-20-18H28V82H10v38h20v20h38v-18H48v-20zm0-2V82H30v18h18zm-20 22H10v18h18v-18zm54 0v18h38v-20h20V82h-18v20h-20v20H82zm18-20H82v18h18v-18zm2-2h18V82h-18v18zm20 40v-18h18v18h-18zM30 0h-2v8H8v20H0v2h8v40h42V50h20V8H30V0zm20 48h18V30H50v18zm18-20H48v20H28v20H10V30h20V10h38v18zM30 50h18v18H30V50zm-2-40H10v18h18V10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>
