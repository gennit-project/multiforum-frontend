<script lang="ts">
import { defineComponent } from "vue";
import { setGallery, Gallery } from "vue-preview-imgs";
import { ref } from "vue";

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
    Gallery,
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
    console.log("props.mediaMetadata", props.mediaMetadata);
    // Define your reactive properties
    const embeddedImages = ref<GalleryItem[]>([]);

    if (!props.imageUrl && props.mediaMetadata) {
      for (let imageID in props.mediaMetadata) {
        const imageData = props.mediaMetadata[imageID];
        const largestImage = imageData.s;

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
    console.log("embeddedImages", embeddedImages.value);

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
  },
});
</script>

<template>
  <div class="w-full">
    <v-carousel>
      <v-carousel-item
        v-for="(item, i) in embeddedImages"
        :key="i"
        :src="item.src"
        @click="handleClick"
        cover
      />
    </v-carousel>
    <button>Images</button>
  </div>
</template>
<style>
.github-markdown-body img {
  cursor: pointer !important;
}
p,
li {
  font-size: 0.9rem;
  line-height: 1.3rem;
}
</style>
