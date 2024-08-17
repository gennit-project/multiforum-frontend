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
    const getImageClass = (index: number, total: number) => {
      /*
        - for a single image, display it full width.
        - for two images, display each at half width.
        - for three images, display the first at full width and the second at half width.
        - for four images, display the first at full width and the rest at one-third width.
        - for five images, display the first two at half width and the rest at one-third width.
        - for six images, display the first at full width, next two at half width and the next three at full width.
     */
      if (total === 1) {
        return "col-span-12";
      } else if (total === 2) {
        return "col-span-6";
      } else if (total === 3) {
        return index === 0 ? "col-span-12" : "col-span-6";
      } else if (total === 4) {
        return index === 0 ? "col-span-12" : "col-span-4";
      } else if (total === 5) {
        return index < 2 ? "col-span-6" : "col-span-4";
      } else if (total === 6) {
        return index === 0
          ? "col-span-12"
          : index < 3
            ? "col-span-6"
            : "col-span-4";
      }
      return "col-span-4";
    };

    return {
      getImageClass,
    };
  },
});
</script>
<template>
  <div class="grid grid-cols-12 gap-1">
    <div
      v-for="(image, index) in album.Images"
      :key="image.id"
      :class="getImageClass(index, album.Images.length)"
    >
      <img
        :src="image.url"
        :alt="image.alt"
        class="w-full object-cover shadow-sm"
      />
      <figcaption class="text-center">{{ image.alt }}</figcaption>
    </div>
  </div>
</template>
