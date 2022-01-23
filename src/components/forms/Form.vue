<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    setup(){}
})
</script>
<template>
<div class="bg-gray-100 pt-8 pb-8 h-full">
    <form
      class="
        mx-auto
        space-y-8
        divide-y divide-gray-200
        max-w-4xl
        border
        bg-white
        p-8
        shadow
        rounded
      "
    >
    <slot/>
    </form>
</div>
</template>