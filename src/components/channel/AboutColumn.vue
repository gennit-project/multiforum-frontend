<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_CHANNEL } from "@/graphQLData/channel/queries";
import { useRoute, useRouter } from "vue-router";
import Tag from "@/components/tag/Tag.vue";
import MdEditor from "md-editor-v3";
import RequireAuth from "../auth/RequireAuth.vue";
import "md-editor-v3/lib/style.css";
import { useDisplay } from "vuetify";

export default defineComponent({
  name: "OverviewPage",
  components: {
    MdEditor,
    RequireAuth,
    Tag,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const channelId: string | string[] = route.params.channelId;

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
  <div class="bg-white dark:bg-gray-700 w-[300px] flex-shrink-0 ml-2 border">
    <div class="flex justify-between border-b">
      <span
        class="mx-6 my-2 font-bold text-blue-500 text-sm leading-6 mb-2 dark:text-gray-300"
      >
        About
      </span>
      <button @click="$emit('closeLeftColumn')" class="p-2">
        <!-- This is a simple right arrow SVG icon, indicating the collapse action. -->

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          class="w-6 h-6 text-gray-500"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          ></path>
        </svg>
      </button>
    </div>

    <div class="w-full h-full py-3">
      <p v-if="getChannelLoading">Loading...</p>
      <div v-else-if="getChannelError">
        <div v-for="(error, i) of getChannelError?.graphQLErrors" :key="i">
          {{ error.message }}
        </div>
      </div>
      <div v-else-if="channel">
        <div v-if="!mdAndDown">
          <div v-if="channel.description">
            <md-editor
              v-model="channel.description"
              language="en-US"
              previewTheme="github"
              preview-only
            />
          </div>
          <p v-else class="mx-6">
            {{ "This channel has no description." }}
          </p>
        </div>

        <div class="mt-6">
          <div v-if="channel.Tags.length > 0">
            <div class="flex justify-between border-b">
              <span
                class="text-blue-500 mx-6 my-2 font-bold text-sm leading-6 mb-2 dark:text-gray-300"
              >
                Tags
              </span>
            </div>
          
            <div class="flex flex-wrap mt-2 px-6 mb-6">
              <Tag
                class="mb-1"
                v-for="tag in channel.Tags"
                :tag="tag.text"
                :key="tag.text"
                @click="filterChannelsByTag(tag.text)"
              />
            </div>
          </div>
          <div class="flex justify-between border-b">
            <span
              class="text-blue-500 mx-6 my-2 font-bold text-sm leading-6 mb-2 dark:text-gray-300"
            >
              Admins
            </span>
          </div>
          <ul
            class="font-bold underline text-sm mx-6 my-3"
            v-if="channel.Admins.length > 0"
          >
            <li v-for="admin in channel.Admins" :key="admin.username">
              <router-link :key="admin.username" :to="`/u/${admin.username}`">
                {{ admin.username }}
              </router-link>
            </li>
          </ul>
          <p class="text-sm mb-6 mx-6 my-3" v-else>
            This channel does not have any admins.
          </p>
          
        </div>
        
      </div>
     
      <RequireAuth :require-ownership="true" :owners="ownerList" :justify-left="true" class="w-full">
        <template v-slot:has-auth>
          <div class="flex justify-between border-b w-full">
            <span
              class="mx-6 my-2 font-bold text-sm leading-6 mb-2 text-gray-600 dark:text-gray-300 w-full"
            >
              Admin Actions
            </span>
          </div>
          <router-link
            class="underline text-sm mx-6 my-3"
            :to="`/channels/c/${channelId}/edit`"
            >Edit</router-link
          >
          <!-- &#8226;
          <span
            class="underline font-medium text-gray-900 cursor-pointer"
            @click="confirmDeleteIsOpen = true"
          >
            Delete
          </span> -->
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