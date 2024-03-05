<script lang="ts">
import { defineComponent, watch } from "vue";
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
  showThumbnailRow: boolean,
) {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  const offsetForThumbnailRow = showThumbnailRow ? 100 : 0;
  return {
    width: srcWidth * ratio,
    height: srcHeight * ratio - offsetForThumbnailRow,
  };
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

    const lightbox = setGallery({
      dataSource: embeddedImages.value,
      wheelToZoom: true,
    });

    // // Define a function to update the dimensions
    const updateImageDimensions = (src: string) => {
      const img = new Image();
      img.onload = function () {
        const { width, height } = calculateAspectRatioFit(
          this.width,
          this.height,
          window.innerWidth,
          window.innerHeight,
          showThumbnailRow.value,
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

    const showThumbnailRow = ref(false);
    watch(showThumbnailRow, (newValue) => {
      console.log("showThumbnailRow", newValue);
      const elements = document.querySelectorAll(
        ".pswp__scroll-wrap, .pswp__bg, .pswp--open, .pswp__zoom-wrap, .pswp__img, .pswp__img--placeholder",
      );

      console.log("elements", elements);
      elements.forEach((el) => {
        // @ts-ignore
        if (el.style && newValue) {
          // @ts-ignore
          el.style["height"] = "calc(100vh - 110px)";

          console.log("setting height: ", el.style["height"]);
        }
      });
    });
    return {
      embeddedImages,
      lightbox,
      updateImageDimensions,
      modules: [Navigation],
      showThumbnailRow,
      activeImageIndex: ref(0),
    };
  },
  methods: {
    setActiveImage(index: number) {
      console.log("set active index", index);
      this.activeImageIndex = index;
      // The active thumbnail is scrolled into view.
      this.scrollToActiveThumbnail();

      // Open Gallery with clickedIndex highlighted
      this.lightbox.pswp.goTo(index);
    },
    handleClick(event: any) {
      if (event.target.tagName === "IMG") {
        const clickedSrc = event.target.src;

        // Update the clicked image dimensions
        this.updateImageDimensions(clickedSrc);

        // Find index of clicked image in embeddedImages array
        const clickedIndex = this.embeddedImages.findIndex(
          (image: GalleryItem) => image.href === clickedSrc,
        );
        this.activeImageIndex = clickedIndex;

        // Open Gallery with clickedIndex highlighted
        this.lightbox.loadAndOpen(clickedIndex);

        this.lightbox.on("close", () => {
          this.showThumbnailRow = false;
        });

        this.lightbox.on("change", () => {
          console.log("on change event", this.lightbox.pswp.currSlide.index);
          this.activeImageIndex = this.lightbox.pswp.currSlide.index;
          this.scrollToActiveThumbnail();
        });

        // on lightbox open, show the thumbnail row
        this.lightbox.on("beforeOpen", () => {
          console.log("on open event");
          this.showThumbnailRow = true;
        });
      } else {
        this.showThumbnailRow = false;
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
          this.showThumbnailRow,
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
    scrollToActiveThumbnail() {
      console.log("scrollToActiveThumbnail");
      this.$nextTick(() => {
        const scrollContainer = document.querySelector('.thumbnail-row');
        const activeThumbnail = document.querySelector('.border-green-500');

        if (scrollContainer && activeThumbnail) {
          const containerScrollLeft = scrollContainer.scrollLeft;
          const containerWidth = scrollContainer.offsetWidth;

          const thumbnailOffsetLeft = activeThumbnail.offsetLeft;
          const thumbnailWidth = activeThumbnail.offsetWidth;

          // Calculate the positions
          const startVisibleArea = containerScrollLeft;
          const endVisibleArea = startVisibleArea + containerWidth;

          const thumbnailStart = thumbnailOffsetLeft;
          const thumbnailEnd = thumbnailStart + thumbnailWidth;

          // Check if the thumbnail is not fully visible
          if (thumbnailStart < startVisibleArea) {
            // Thumbnail is off to the left
            scrollContainer.scrollLeft = thumbnailStart;
          } else if (thumbnailEnd > endVisibleArea) {
            // Thumbnail is off to the right
            scrollContainer.scrollLeft = thumbnailStart - containerWidth + thumbnailWidth;
          }

          // For centering the thumbnail, you might adjust the calculation
          // Example for centering:
          // scrollContainer.scrollLeft = thumbnailOffsetLeft + thumbnailWidth / 2 - containerWidth / 2;
        }
      });
    },
  },
});
</script>

<template>
  <div
    :class="{ 'thumbnails-shown': showThumbnailRow }"
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
          <img :src="image.src" class="cursor-pointer" @click="handleClick" />
        </swiper-slide>
      </swiper>

      <img
        v-else-if="imageUrl && imageUrl.match(/\.(jpeg|jpg|gif|png)$/)"
        :src="imageUrl"
        class="max-w-sm cursor-pointer"
        @click="handleClickSingleImage"
      />
    </div>
    <div
      v-if="showThumbnailRow"
      :key="activeImageIndex"
      class="thumbnail-row flex-row gap-2 overflow-x-auto bg-black"
    >
      <img
        v-for="(image, index) in embeddedImages"
        :key="index"
        :class="[
          activeImageIndex === index ? 'border-green-500' : 'border-black',
        ]"
        :src="image.thumbnail"
        class="constrain-img-height flex cursor-pointer border-4"
        @click="
          () => {
            setActiveImage(index);
          }
        "
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

.thumbnail-row {
  display: flex;
  position: fixed;
  height: 108px;
  width: 100%;
  left: 0;
  bottom: 0;
  z-index: 10;
}

.constrain-img-height {
  height: 92px;
}
</style>
