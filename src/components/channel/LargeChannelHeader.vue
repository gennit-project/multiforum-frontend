<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {},
  props: {
    channelId: {
      type: String,
      required: true,
    },
  },
});
</script>

<template>
  <section aria-labelledby="section-2-title h-full">
    <div
      class="overflow-hidden rounded-lg shadow pb-4 h-full bg-white dark:bg-gray-800"
    >
      <div
        class="h-24 w-full object-cover user-background"
        alt="background pattern"
      ></div>
      <div class="lg:-mt-8">
        <div class="space-y-2 px-4">
          <div
            class="h-24 w-24 rounded-full px-4 ring-4 ring-white dark:ring-slate-900"
            id="channelAvatar"
          ></div>
          <h1 class="text-2xl no-underline mt-4">
            {{ channelId }}
          </h1>
        </div>
      </div>
      <slot></slot>
    </div>
  </section>
</template>
