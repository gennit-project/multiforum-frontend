
<script lang="ts">
import { defineComponent, PropType } from "vue";
import Multiselect from "@vueform/multiselect";

export default defineComponent({
  setup() {},
  components: {
    Multiselect,
  },
  data(props) {
    const formattedTagOptions = props.tagOptions.map(tag => {
        return {
          value: tag,
          label: tag
        }
      })
    return {
      value: props.selectedTags,
      formattedTagOptions
    };
  },
  props: {
    selectedTags: {
      type: Array as PropType<string[]>,
      default: () => { return [] }
    },
    tagOptions: {
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
      :placeholder="'Enter tags here'"
      :closeOnSelect="false"
      :searchable="true"
      :createTag="true"
      :options="formattedTagOptions"
    />
  </div>
</template>


<style src="@vueform/multiselect/themes/default.css">
</style>
