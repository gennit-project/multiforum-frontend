<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {},
  props: {
    label: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<template>
  <nav class="flex cursor-pointer px-3 link rounded-t-md " :class="[
        active
          ? 'active-border text-gray-800'
          : 'inactive-border text-gray-400 hover:text-gray-800',
        'whitespace-nowrap py-2 font-medium text-sm',
      ]" aria-label="Tabs">

      {{ label }}
  </nav>
</template>

<style>


.active-border {
   border-top: 1px solid gray;
   border-left: 1px solid gray;
   border-right: 1px solid gray;
   border-bottom: 1px solid white;
}

.inactive-border {
   border-top: 1px solid lightgray;
   border-left: 1px solid lightgray;
   border-right: 1px solid lightgray;
   border-bottom: 1px solid transparent;;
}

.link {
    margin-bottom: -1px;
    display: block;
    padding: 0.5rem 1rem;
    text-decoration: none;
}
</style>