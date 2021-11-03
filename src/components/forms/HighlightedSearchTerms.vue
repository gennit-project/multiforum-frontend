<script lang="ts">
import { defineComponent } from "vue";
// Split on highlight term and divide term into parts, ignore case
// Used help from https://stackoverflow.com/questions/29652862/highlight-text-using-reactjs

export default defineComponent({
  setup(props) {
    const parts = props.text.split(new RegExp(`(${props.searchInput})`, "gi"));
    return {
      parts,
    };
  },
  props: {
    text: {
      type: String,
      required: true,
    },
    searchInput: {
      type: String,
      required: true,
    },
  },
  methods: {
    match(part: string, searchInput: string) {
      return part.toLowerCase() === searchInput.toLowerCase();
    },
  },
});
</script>
<template>
  <span :key="i" v-for="(part, i) in parts">
    <mark v-if="match(part, searchInput)">
      {{ part }}
    </mark>
    <span v-else>{{ part }}</span>
  </span>
</template>