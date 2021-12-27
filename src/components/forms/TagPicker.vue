
<script lang="ts">
import { defineComponent, PropType } from "vue";
import Multiselect from "@vueform/multiselect";

export default defineComponent({
  setup() {},
  components: {
    Multiselect,
  },
  data(props) {
    const formattedTagOptions = props.tagOptions.map((tag) => {
      return {
        value: tag,
        label: tag,
      };
    });
    return {
      value: props.selectedTags,
      formattedTagOptions,
    };
  },
  props: {
    selectedTags: {
      type: Array as PropType<string[]>,
      default: () => {
        return [];
      },
    },
    tagOptions: {
      type: Array as PropType<string[]>,
      default: () => {
        return [];
      },
    },
  },
});
</script>
<template>
    <Multiselect
      v-model="value"
      class="wide"
      mode="tags"
      @select="$emit('setTagFilters', value)"
      @deselect="$emit('setTagFilters', [])"
      @clear="$emit('setTagFilters', [])"
      :placeholder="'Enter tags here'"
      :closeOnSelect="false"
      :searchable="true"
      :options="formattedTagOptions"
    />
</template>

<style src="@vueform/multiselect/themes/default.css"></style>
<style >
.wide {
  min-width: 250px;
}
</style>
