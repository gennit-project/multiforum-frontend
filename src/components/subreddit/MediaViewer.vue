<script lang="ts">
import { defineComponent } from "vue";
import { setGallery } from "vue-preview-imgs";
import { ref } from "vue";
import "swiper/css/bundle";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation } from "swiper/modules";
import "swiper/css";

import "swiper/css/navigation";
import "./style.css";

type GalleryItem = {
  href: string;
  src: string;
  thumbnail: string;
  width: number;
  height: number;
};

function calculateAspectRatioFit(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number,
) {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  return { width: srcWidth * ratio, height: srcHeight * ratio };
}

export default defineComponent({
  components: {
    Swiper,
    SwiperSlide,
  },
  props: {
    mediaMetadata: {
      type: Object,
      default: () => ({}),
    },
    imageUrl: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    // Define your reactive properties
    const embeddedImages = ref<GalleryItem[]>([]);

    if (props.mediaMetadata) {
      for (let imageID in props.mediaMetadata) {
        const imageData = props.mediaMetadata[imageID];
        const largestImage = imageData.s;
        if (!largestImage) continue;

        const galleryItem: GalleryItem = {
          href: largestImage.u,
          src: largestImage.u,
          thumbnail:
            largestImage.p && largestImage.p.length > 0
              ? largestImage.p[0].u
              : largestImage.u,
          width: largestImage.x,
          height: largestImage.y,
        };

        embeddedImages.value.push(galleryItem);
      }
    }

    // // Define a function to update the dimensions
    const updateImageDimensions = (src: string) => {
      const img = new Image();
      img.onload = function () {
        const { width, height } = calculateAspectRatioFit(
          this.width,
          this.height,
          window.innerWidth,
          window.innerHeight,
        );

        // Find the image in the embeddedImages array and update its dimensions
        const imageItem = embeddedImages.value.find((item) => item.src === src);
        if (imageItem) {
          imageItem.width = width;
          imageItem.height = height;
        } else {
          // Or add a new item if it doesn't exist
          embeddedImages.value.push({
            href: src,
            src,
            thumbnail: src,
            width,
            height,
          });
        }
      };
      img.src = src;
    };

    return {
      embeddedImages,
      updateImageDimensions,
      modules: [Navigation],
    };
  },
  methods: {
    handleClick(event: any) {
      if (event.target.tagName === "IMG") {
        const clickedSrc = event.target.src;

        // Update the clicked image dimensions
        this.updateImageDimensions(clickedSrc);

        // Find index of clicked image in embeddedImages array
        const clickedIndex = this.embeddedImages.findIndex(
          (image: GalleryItem) => image.href === clickedSrc,
        );

        // Open Gallery with clickedIndex highlighted
        const lightbox = setGallery({
          dataSource: this.embeddedImages,
          wheelToZoom: true,
        });

        lightbox.loadAndOpen(clickedIndex);
      }
    },
    handleClickSingleImage() {
      const img = new Image();
      img.onload = () => {
        // Image is now fully loaded; perform aspect ratio calculation
        const { width, height } = calculateAspectRatioFit(
          img.width,
          img.height,
          window.innerWidth,
          window.innerHeight,
        );

        const lightbox = setGallery({
          dataSource: [
            {
              href: this.imageUrl,
              src: this.imageUrl,
              thumbnail: this.imageUrl,
              width,
              height,
            },
          ],
          wheelToZoom: true,
        });

        lightbox.loadAndOpen(0);
      };
      img.src = this.imageUrl; // This starts the image loading process
    },
  },
});
</script>

<template>
  <div
    class="overflow-x-auto rounded-lg border bg-black p-4 dark:border-gray-600"
  >
    <figcaption class="mb-2 text-sm text-gray-200">
      {{
        `${embeddedImages.length || 1} image${embeddedImages.length === 1 || embeddedImages.length === 0 ? "" : "s"}`
      }}
    </figcaption>
    <div class="flex justify-center">
      <swiper
        v-if="embeddedImages.length > 0"
        class="mySwiper"
        :navigation="true"
        :modules="modules"
        :space-between="10"
        :slides-per-view="Math.min(embeddedImages.length, 3)"
      >
        <swiper-slide
          v-for="(image, index) in embeddedImages"
          :key="index"
          class="max-w-sm"
        >
          <img
            :src="image.src"
            class="cursor-pointer"
            @click="handleClick"
          >
        </swiper-slide>
      </swiper>

      <img
        v-else-if="imageUrl && imageUrl.match(/\.(jpeg|jpg|gif|png)$/)"
        :src="imageUrl"
        class="max-w-sm cursor-pointer"
        @click="handleClickSingleImage"
      >
    </div>
  </div>
</template>
<style lang="scss">
.github-markdown-body img {
  cursor: pointer !important;
}
.v-btn {
  color: white !important;
  background-color: black !important;
  opacity: 0.6 !important;
  &:hover {
    color: white !important;
  }

  .v-btn__content {
    color: black !important;
  }

  .v-icon {
    color: white !important;
  }
}

p,
li {
  font-size: 0.9rem;
  line-height: 1.3rem;
}
</style>
