<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { Album } from "@/__generated__/graphql";

export default defineComponent({
  name: "DiscussionAlbum",
  props: {
    album: {
      type: Object as PropType<Album>,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>
<template>
  <div class="grid grid-cols-12 gap-1">
    <div v-for="image in album.Images" :key="image.id" :class="'col-span-6'">
      <img
        :src="image.url"
        :alt="image.alt"
        class="w-full object-cover shadow-sm"
      />
      <figcaption class="text-center">{{ image.alt }}</figcaption>
    </div>
  </div>
</template>
