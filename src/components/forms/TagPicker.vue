
<script lang="ts">
import { defineComponent, PropType } from "vue";
import Multiselect from "@vueform/multiselect";

export default defineComponent({
  setup() {},
  components: {
    Multiselect,
  },
  data(props) {
    return {
      value: props.selectedTags,
      options: ["Batman", "Robin", "Joker"],
    };
  },
  props: {
    selectedTags: {
      type: Array as PropType<string[]>,
      default: () => { return [] }
    }
  }
});
</script>
<template>
  <div>
    <h1>Filter by Tags</h1>
    <Multiselect
      v-model="value"
      mode="tags"
      @select="$emit('setTagFilters', value)"
      @deselect="$emit('setTagFilters', value)"
      :closeOnSelect="false"
      :searchable="true"
      :createTag="true"
      :options="[
        { value: 'batman', label: 'Batman' },
        { value: 'robin', label: 'Robin' },
        { value: 'joker', label: 'Joker' },
      ]"
    />
  </div>
</template>


<style src="@vueform/multiselect/themes/default.css"></style>
