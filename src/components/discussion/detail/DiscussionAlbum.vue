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
  setup(props) {
    const getImageClass = (index: number, total: number) => {
      if (total === 1) return "col-span-3"; // full width
      if (total === 2) return "col-span-2"; // half width

      switch (total % 3) {
        case 0:
          return "col-span-1";
        case 1:
          return index === total - 1 ? "col-span-2" : "col-span-1";
        case 2:
          return index >= total - 2 ? "col-span-2" : "col-span-1";
      }
    };

    const gridColumns = computed(() => {
      if (props.album.Images.length === 1 || props.album.Images.length === 2) {
        return "grid-cols-2";
      }
      return "grid-cols-3";
    });

    return {
      getImageClass,
      gridColumns,
    };
  },
});
</script>
<template>
  <div class="grid gap-4" :class="gridColumns">
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
