<script lang="ts">
import { defineComponent, ref, PropType } from "vue";
import Lightgallery from "lightgallery/vue";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";

// If you are using SCSS, you can skip the CSS imports below and use SCSS instead
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-thumbnail.css";
import "lightgallery/css/lg-zoom.css";

import { Album } from "@/__generated__/graphql";

export default defineComponent({
  name: "DiscussionAlbum",
  components: {
    Lightgallery,
  },
  props: {
    album: {
      type: Object as PropType<Album>,
      required: true,
    },
  },
  setup() {
    const plugins = ref([lgThumbnail, lgZoom]);

    return {
      plugins,
    };
  },
});
</script>

<template>
  <lightgallery
    :settings="{ speed: 500, plugins: plugins }"
    class="grid grid-cols-2 gap-2"
  >
    <a
      v-for="image in album.Images"
      :key="image.id"
      :href="image.url"
    >
      <img
        :src="image.url"
        :alt="image.alt"
        class="shadow-sm"
      >
      <figcaption class="text-center">
        {{ image.alt }}
      </figcaption>
    </a>
  </lightgallery>
</template>

<style scoped>
img {
  cursor: pointer;
}
</style>
