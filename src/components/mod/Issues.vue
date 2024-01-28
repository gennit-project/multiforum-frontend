<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BackLink",
  components: {
    // LeftArrowIcon,
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
 <div>placeholder</div>
</template>
