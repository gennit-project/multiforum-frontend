<script lang="ts">
import { defineComponent, ref, PropType } from "vue";
import VueEasyLightbox from "vue-easy-lightbox";
import { Album } from "@/__generated__/graphql";

export default defineComponent({
  name: "DiscussionAlbum",
  components: {
    VueEasyLightbox,
  },
  props: {
    album: {
      type: Object as PropType<Album>,
      required: true,
    },
  },
  setup(props) {
    const visibleRef = ref(false);
    const indexRef = ref(0);
    const embeddedImages = ref(
      props.album.Images.map((image) => image.url)
    );

    const handleImageClick = (index: number) => {
      indexRef.value = index;
      visibleRef.value = true;
    };

    const onHide = () => {
      visibleRef.value = false;
    };

    return {
      visibleRef,
      indexRef,
      embeddedImages,
      handleImageClick,
      onHide,
    };
  },
});
</script>

<template>
  <div class="grid grid-cols-12 gap-1">
    <div
      v-for="(image, index) in album.Images"
      :key="image.id"
      :class="'col-span-6'"
      @click="handleImageClick(index)"
    >
      <img
        :src="image.url"
        :alt="image.alt"
        class="w-full object-cover shadow-sm cursor-pointer"
      >
      <figcaption class="text-center">
        {{ image.alt }}
      </figcaption>
    </div>
    <vue-easy-lightbox
      :visible="visibleRef"
      :imgs="embeddedImages"
      :index="indexRef"
      @hide="onHide"
    />
  </div>
</template>

<style scoped>
img {
  cursor: pointer;
}
</style>
