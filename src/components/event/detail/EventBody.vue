<script lang="ts">
import { defineComponent, PropType, ref, computed } from "vue";
import MarkdownPreview from "@/components/generic/forms/MarkdownPreview.vue";
import { Event } from "@/__generated__/graphql";

export default defineComponent({
  name: "EventBody",
  components: {
    MarkdownPreview,
  },
  props: {
    event: {
      type: Object as PropType<Event>,
      required: true,
    },
  },
  setup(props) {
    const showFullDescription = ref(false);

    const visibleDescription = computed(() => {
      if (!props.event.description) {
        return "";
      }
      if (showFullDescription.value) {
        return props.event.description;
      }

      return props.event.description.split(" ").slice(0, 50).join(" ");
    });

    const toggleDescription = () => {
      showFullDescription.value = !showFullDescription.value;
    };

    return {
      showFullDescription,
      visibleDescription,
      toggleDescription,
    };
  },
});
</script>
<template>
  <div>
    <MarkdownPreview
      :text="visibleDescription"
      :disable-gallery="false"
      class="-ml-4"
    />
    <button
      v-if="event?.description && event.description.split(' ').length > 50"
      class="mt-2 rounded bg-black px-4 py-2 font-bold text-white hover:bg-blue-700"
      @click="toggleDescription"
    >
      {{ showFullDescription ? "Show less" : "Show more" }}
    </button>
  </div>
</template>
