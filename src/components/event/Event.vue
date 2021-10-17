<script lang="ts">
import { defineComponent, computed } from "vue";
import Back from "../buttons/Back.vue";
import { useRoute } from "vue-router";

export default defineComponent({
  setup() {
    const route = useRoute();
    const eventId = computed(() => {
      return route.params.eventId;
    });
    return {
      eventId
    }
  },
  components: {
    Back,
  },
});
</script>

<template>
  <Back />
  <p class="text-md font-medium text-gray-800 truncate">
    <span>Title</span>
  </p>
  <p class="text-sm font-medium text-gray-800 truncate">Details</p>
</template>