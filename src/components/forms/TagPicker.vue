
<script lang="ts">
import { defineComponent } from "vue";
import Multiselect from "@vueform/multiselect";

export default defineComponent({
  setup() {},
  components: {
    Multiselect,
  },
  data() {
    return {
      value: null,
      options: ["Batman", "Robin", "Joker"],
    };
  },
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
