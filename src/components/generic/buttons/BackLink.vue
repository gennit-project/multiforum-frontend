<script lang="ts">
import { defineComponent } from "vue";
import LeftArrowIcon from "../../icons/LeftArrowIcon.vue";

export default defineComponent({
  name: "BackLink",
  components: {
    LeftArrowIcon,
  },
  props: {
    link: {
      type: String,
      default: "",
    },
    dataTestid: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      default: "Back",
    },
  },
  setup() {},
});
</script>

<template>
  <router-link
    :to="link"
    :data-testid="dataTestid"
    class="inline-flex items-center text-xs gap-2 text-blue-500 hover:underline"
  >
    <LeftArrowIcon class="h-4 w-4" /> {{ text }}
  </router-link>
</template>
