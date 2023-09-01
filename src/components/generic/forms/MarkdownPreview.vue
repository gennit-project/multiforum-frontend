<script lang="ts">
import { defineComponent } from "vue";
import { setGallery } from "vue-preview-imgs";
import MarkdownIt from "markdown-it";
import { ref, watchEffect } from "vue";

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

function parseMarkdownForImages(text: string) {
  const md = new MarkdownIt();
  const renderedText = md.render(text);
  const regex = /src="([^"]*)"/g;
  const images: GalleryItem[] = [];
  let match;

  while ((match = regex.exec(renderedText)) !== null) {
    const src = match[1];
    const galleryItem: GalleryItem = {
      href: src,
      src,
      thumbnail: src,
      width: window.innerWidth,
      height: window.innerHeight,
    };
    images.push(galleryItem);
  }

  return images;
}

export default defineComponent({
  props: {
    text: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    // Define your reactive properties
    const embeddedImages = ref<GalleryItem[]>([]);

    // Define a function to update the dimensions
    const updateImageDimensions = (src: string) => {
      const img = new Image();
      img.onload = function () {
        const { width, height } = calculateAspectRatioFit(
          this.width,
          this.height,
          window.innerWidth,
          window.innerHeight
        );
        console.log('calculated aspect ratio fit', { width, height })

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

    // Watch for changes in the markdownContent and update embeddedImages accordingly
    watchEffect(() => {
        console.log(    'i ran')
      const imageUrls = parseMarkdownForImages(props.text);

      // Update dimensions for each image
      imageUrls.forEach((imageUrl: GalleryItem) => {
        updateImageDimensions(imageUrl.src);
      });
    });

    return {
      embeddedImages,
    };
  },
  methods: {
    handleImageClick(event: any) {
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
  <div @click="handleImageClick($event)">
    <v-md-preview :text="text" />
  </div>
</template>
<style>
.github-markdown-body img {
  cursor: pointer !important;
}
</style>
