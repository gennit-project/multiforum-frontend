<script lang="ts">
import { computed, defineComponent } from "vue";
import { setGallery } from "vue-preview-imgs";
import MarkdownIt from "markdown-it";
import { ref, watchEffect } from "vue";
import config from "@/config";

function linkifyUsernames(markdownString: string) {
  // Use a regular expression to find "u/[username]" patterns
  const regex = /u\/([a-zA-Z0-9_\-]+)/g;

  // Replace each match with "[u/username](${config.baseUrl}u/username)"
  return markdownString.replace(regex, (match, username) => {
    return `[${match}](${config.baseUrl}u/${username})`;
  });
}

function linkifyChannelNames(markdownString: string) {
  // Use a regular expression to find "c/[channelName]" patterns
  const regex = /c\/([a-zA-Z0-9_\-]+)/g;

  // Replace each match with "[c/channelName](${config.baseUrl}c/channelName)"
  return markdownString.replace(regex, (match, channelName) => {
    return `[${match}](${config.baseUrl}channels/c/${channelName}/discussions)`;
  });
}

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
    disableGallery: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      required: true,
    },
    wordLimit: {
      type: Number,
      default: 100,
    },
  },
  setup(props) {
    // Define your reactive properties
    const embeddedImages = ref<GalleryItem[]>([]);

    const countWords = (str: string) => {
      return str.trim().split(/\s+/).length;
    };

    const showFullText = ref(countWords(props.text) < props.wordLimit);

    const shouldShowMoreButton = computed(() => {
      if (!props.text) {
        return false;
      }
      const words = props.text.split(" ");
      return words.length > props.wordLimit;
    });

    const toggleShowFullText = () => {
      showFullText.value = !showFullText.value;
    };

    // Define a function to update the dimensions
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

    // Watch for changes in the markdownContent and update embeddedImages accordingly
    watchEffect(() => {
      const imageUrls = parseMarkdownForImages(props.text);

      // Update dimensions for each image
      imageUrls.forEach((imageUrl: GalleryItem) => {
        updateImageDimensions(imageUrl.src);
      });
    });

    const linkifiedMarkdown = computed(() => {
      const usernamesLinkified = linkifyUsernames(props.text);
      return linkifyChannelNames(usernamesLinkified);
    });

    const shownText = computed(() => {
      if (showFullText.value) {
        return linkifiedMarkdown.value;
      }
      const words = linkifiedMarkdown.value.split(" ");
      if (words.length > props.wordLimit) {
        return (
          words.slice(0, props.wordLimit).join(" ") +
          (words.length > props.wordLimit ? "..." : "")
        );
      }
      return linkifiedMarkdown.value;
    });

    return {
      embeddedImages,
      shownText,
      showFullText,
      toggleShowFullText,
      shouldShowMoreButton,
    };
  },
  methods: {
    handleImageClick(event: any) {
      if (this.disableGallery) {
        return;
      }
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
  <div
    class="w-full"
  >
    <v-md-preview 
      :text="shownText" 
      @click="handleImageClick($event)"
    />
    <button
      v-if="shouldShowMoreButton"
      class="mb-8 ml-8 text-sm text-blue-600 hover:underline dark:text-gray-300"
      @click="toggleShowFullText"
    >
      {{ showFullText ? "Show Less" : "Show More" }}
    </button>
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
