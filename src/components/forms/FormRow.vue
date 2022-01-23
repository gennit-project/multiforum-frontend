
<script lang="ts">
import { defineComponent } from "vue";
import FormSectionTitle from "./FormSectionTitle.vue";

export default defineComponent({
    components: {
        FormSectionTitle
    },
    setup(){},
    props: {
        sectionTitle: {
            type: String,
            default: ''
        }
    }
})
</script>

<template>
  <div
    class="
      sm:grid
      sm:grid-cols-3
      sm:gap-4
      sm:items-start
      sm:border-t
      sm:border-gray-200
      sm:pt-5
    "
  >
    <FormSectionTitle>
      {{ sectionTitle }}
    </FormSectionTitle>
    <div class="mt-1 sm:mt-0 sm:col-span-2">
      <slot />
    </div>
  </div>
</template>