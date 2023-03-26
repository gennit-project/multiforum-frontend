<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VoteComponent",
  props: {
    downvoteActive: {
      type: Boolean,
      default: false,
    },
    upvoteActive: {
      type: Boolean,
      default: false,
    },
    downvoteCount: {
      type: Number,
      default: 0,
    },
    upvoteCount: {
      type: Number,
      default: 0,
    },
  },
  setup() {
    console.log("vote buttons ran");
    return {};
  },
  methods: {
    clickDown() {
      this.$emit("clickDown");
    },
    clickUp() {
      this.$emit("clickUp");
    },
  },
});
</script>
<template>
  <div class="flex flex-col">
    <span class="inline-flex">
      <i
        class="fa-solid fa-sort-up w-4 hover:text-black cursor-pointer"
        :class="[upvoteActive ? 'text-black' : 'text-gray-400']"
        @click="clickUp"
      ></i>
      <v-tooltip activator="parent" location="top"
        >This post should be more visible to others</v-tooltip
      >
    </span>

    <span
      class="inline-flex "
      :class="downvoteActive ? 'text-black' : 'text-gray-400'"
      >{{ upvoteCount - downvoteCount }}</span
    >

    <span class="inline-flex">
      <i
        class="fa-solid fa-sort-down  w-4 hover:text-black cursor-pointer"
        :class="[downvoteActive ? 'text-black' : 'text-gray-400']"
        @click="clickDown"
      ></i>
      <v-tooltip activator="parent" location="top"
        >This post should be less visible to others</v-tooltip
      >
    </span>
  </div>
</template>
<style scoped></style>
