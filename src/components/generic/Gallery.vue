<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
    name: "GalleryPics",
    props: {
        links: {
            type: Array as PropType<Array<string>>,
            required: true
        }
    },
    setup() {
        return {
            
        }
    }
})
</script>
<template>
<section class="overflow-hidden text-neutral-700">
    <div class="container mx-auto px-5 py-2 lg:pt-12">
      <div class="-m-1 flex flex-wrap md:-m-2">
        <div v-for="link, i in links" :key="i"  class="flex w-1/3 flex-wrap">
          <div class="w-full p-1 md:p-2">
            <img
              alt="gallery"
              class="block h-full w-full rounded-lg object-cover object-center"
              :src="link" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>