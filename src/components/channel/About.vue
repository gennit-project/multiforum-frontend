<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_CHANNEL } from "@/graphQLData/channel/queries";
import { useRoute, useRouter } from "vue-router";
import Tag from "@/components/buttons/Tag.vue";
import MdEditor from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

export default defineComponent({
  name: "OverviewPage",
  components: {
    MdEditor,
    Tag,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const channelId = route.params.channelId;

    const { result, loading } = useQuery(GET_CHANNEL, {
      uniqueName: channelId,
    });

    const channelDescription = computed(() => {
      const defaultResult = "This channel has no description."
      if (result.value){
        return result.value.channels[0].description || defaultResult;
      }
      return defaultResult;
    })


    const tags = computed(() => {
      if (result.value) {
       return result.value.channels[0].Tags;
      }
      return []
    });

    const admins = computed(() => {
      if (result.value){
        return result.value.channels[0].Admins;
      } 
      return []
    });

    return {
      admins,
      channelDescription,
      channelId,
      confirmDeleteIsOpen: ref(false),
      loading,
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
  <div class="container mt-4 mx-auto">
    <p v-if="loading">Loading...</p>

    <div class="grid md:grid-cols-12">
      <div class="prose md:col-span-9">
        <div v-if="channelDescription" class="body min-height-min">
            <md-editor
              v-model="channelDescription"
              language='en-US'
              previewTheme='github'
              preview-only
            /> 
          </div>
      </div>
      <div class="md:col-span-3 mt-6">
        <div v-if="tags.length > 0">
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
              v-for="tag in tags"
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
        <div class="font-bold text-sm" v-if="admins.length > 0">
          <router-link
            :key="admin.username"
            v-for="admin in admins"
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
        <div class="prose text-sm">
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
