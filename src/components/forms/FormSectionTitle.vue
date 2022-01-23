<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    setup(){}
})
</script>
<template>
  <label
                for="title"
                class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
              >
                <slot/>
              </label>
</template>