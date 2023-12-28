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
  },
  setup() {},
});
</script>

<template>
  <router-link
    :to="link"
    :data-testid="dataTestid"
    class="flex h-10 w-10 items-center justify-center rounded-full border bg-white px-2 text-xs hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-500"
  >
    <LeftArrowIcon class="inline-flex" />
  </router-link>
</template>
