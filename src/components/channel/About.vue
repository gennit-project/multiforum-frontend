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

    const {  mdAndDown } = useDisplay();

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
  <div class="w-full h-full px-6 py-3">
    <p v-if="getChannelLoading">Loading...</p>
    <div v-else-if="getChannelError">
      <div v-for="(error, i) of getChannelError?.graphQLErrors" :key="i">
        {{ error.message }}
      </div>
    </div>
    <div v-else-if="channel">
        <div v-if="!mdAndDown">
          <div v-if="channel.description" >
            <md-editor
              v-model="channel.description"
              language="en-US"
              previewTheme="vuepress"
              preview-only
            />
          </div>
          <p v-else>
            {{ "This channel has no description." }}
          </p>
        </div>

      <div class="mt-6">
        <div v-if="channel.Tags.length > 0">
          <h2
            class="
              text-md
              leading-6
              mb-2
              font-medium
              text-gray-700
              dark:text-gray-300
              border-b border-gray-200
            "
          >
            Tags
          </h2>
          <div class="flex flex-wrap mt-2 mb-6">
            <Tag
              class="mb-1"
              v-for="tag in channel.Tags"
              :tag="tag.text"
              :key="tag.text"
              @click="filterChannelsByTag(tag.text)"
            />
          </div>
        </div>
        <h2
          class="
            text-md
            leading-6
            mb-2
            font-medium
            text-gray-700
            dark:text-gray-300
            border-b border-gray-200
          "
        >
          Admins
        </h2>
        <ul
          class="font-bold underline text-sm"
          v-if="channel.Admins.length > 0"
        >
          <li v-for="admin in channel.Admins" :key="admin.username">
            <router-link :key="admin.username" :to="`/u/${admin.username}`">
              {{ admin.username }}
            </router-link>
          </li>
        </ul>
        <p class="text-sm mb-6" v-else>
          This channel does not have any admins.
        </p>        
        <RequireAuth :require-ownership="true" :owners="ownerList">
          <template v-slot:has-auth>
            <h2
              class="
                text-md
                leading-
                mt-6
                mb-2
                font-medium
                text-gray-700
                dark:text-gray-300
                border-b border-gray-200
              "
            >
              Admin Actions
            </h2>
            <router-link
              class="underline text-sm"
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
  </div>
</template>
