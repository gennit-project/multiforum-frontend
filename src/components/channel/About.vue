<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_CHANNEL } from "@/graphQLData/channel/queries";
import { useRoute, useRouter } from "vue-router";
import Tag from "@/components/buttons/Tag.vue";
import MdEditor from "md-editor-v3";
import "md-editor-v3/lib/style.css";

export default defineComponent({
  name: "OverviewPage",
  components: {
    MdEditor,
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

    return {
      admins,
      channel,
      channelId,
      confirmDeleteIsOpen: ref(false),
      getChannelLoading,
      getChannelError,
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
  <div class="container">
    <p v-if="getChannelLoading">Loading...</p>
    <div v-else-if="getChannelError">
      <div v-for="(error, i) of getChannelError?.graphQLErrors" :key="i">
        {{ error.message }}
      </div>
    </div>
    <div v-else-if="channel" class="grid md:grid-cols-12">
      <div class="md:col-span-9">
        <div>
          <div v-if="channel.description" class="body min-height-min">
            <md-editor
              class="mt-4 pt-4 pb-4 pr-8 pl-8 rounded"
              v-model="channel.description"
              language="en-US"
              previewTheme="github"
              preview-only
            />
          </div>
        </div>
      </div>

      <div class="md:col-span-3 mt-6">
        <div v-if="channel.Tags.length > 0">
          <h2
            class="
              text-md
              leading-6
              mb-2
              font-medium
              text-gray-700
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
            border-b border-gray-200
          "
        >
          Admins
        </h2>
        <div class="font-bold text-sm" v-if="channel.Admins.length > 0">
          <router-link
            v-for="admin in channel.Admins"
            :key="admin.username"
            :to="`/u/${admin.username}`"
          >
            {{ `@${admin.username}` }}
          </router-link>
        </div>

        <p class="text-sm mb-6" v-else>
          This channel does not have any admins.
        </p>

        <h2
          class="
            text-md
            leading-
            mt-6
            mb-2
            font-medium
            text-gray-700
            border-b border-gray-200
          "
        >
          Admin Actions
        </h2>
        <div class="text-sm">
          <span>
            <router-link :to="`/channels/c/${channelId}/edit`"
              >Edit</router-link
            >
          </span>
          &#8226;
          <span
            class="underline font-medium text-gray-900 cursor-pointer"
            @click="confirmDeleteIsOpen = true"
          >
            Delete
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
