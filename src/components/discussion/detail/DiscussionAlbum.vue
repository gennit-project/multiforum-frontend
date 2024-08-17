<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Album } from "@/__generated__/graphql";

export default defineComponent({
  name: "DiscussionAlbum",
  props: {
    album: {
      type: Object as PropType<Album>,
      required: true,
    },
  },
  setup(props) {
    console.log("album", props.album);

    return {};
  },
});
</script>
<template>
  <div class="border-white">
    <div v-for="image in album.Images" :key="image.id">
      <img
        :src="image.url"
        :alt="image.title"
        class="h-36 w-36 rounded-lg object-cover shadow-sm"
      />
      <figcaption>{{ image.title }}</figcaption>
    </div>
  </div>
</template>
