<script lang="ts">
import { defineComponent } from "vue";
import { setGallery } from "vue-preview-imgs";
import { ref } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

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
    handleClickOpenGallery() {
      const lightbox = setGallery({
        dataSource: this.embeddedImages,
        wheelToZoom: true,
      });

      lightbox.loadAndOpen(0);
    },
  },
});
</script>

<template>
  <div class="w-full border p-2 rounded dark:border-gray-600">
    <figcaption class="text-sm mb-2 text-gray-500 dark:text-gray-400">
      Images
    </figcaption>
    <swiper
      v-if="embeddedImages.length > 0"
      :slides-per-view="Math.min(embeddedImages.length, 3)"
      :space-between="10"
    >
      <swiper-slide v-for="(image, index) in embeddedImages" :key="index">
        <img
          :src="image.src"
          cover
          class="cursor-pointer h-72"
          @click="handleClick"
        />
      </swiper-slide>
    </swiper>
    <swiper
      v-else-if="imageUrl"
      :slides-per-view="1"
      :space-between="50"
    >
      <swiper-slide>
        <img
          class="cursor-pointer h-56"
          :src="imageUrl"
          cover
          @click="handleClick"
        />
      </swiper-slide>
    </swiper>

    <button
       v-if="embeddedImages.length > 0" 
        class="v-btn p-2 mt-2 w-full text-center"
       @click="handleClickOpenGallery"
    >
      {{ `View ${embeddedImages.length} images in gallery` }}
      <i class="fas fa-images"></i>
    </button>
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
