<script lang="ts">
export default {
  setup() {},
  props: {
      showMap: {
          type: Boolean,
          required: true
      }
  }
};
</script>
<template>
  <span class="relative z-0 inline-block shadow-sm rounded-md">
    <button
      @click="$emit('showMap')"
      type="button"
      :class="[showMap ? 'bg-gray-50' : '']"
      class="
        relative
        inline-flex
        items-center
        px-4
        py-1.5
        rounded-l-md
        border border-gray-300
        bg-white
        text-xs
        font-medium
        text-gray-700
        hover:bg-gray-50
        focus:z-10
        focus:outline-none
      "
    >
      Map
    </button>
    <button
      @click="$emit('showList')"
      type="button"
      :class="[!showMap ? 'bg-gray-50' : '']"
      class="
        -ml-px
        relative
        inline-flex
        items-center
        px-4
        py-1.5
        rounded-r-md
        border border-gray-300
        bg-white
        text-xs
        font-medium
        text-gray-700
        hover:bg-gray-50
        focus:z-10
        focus:outline-none
      "
    >
      List Only
    </button>
  </span>
</template>