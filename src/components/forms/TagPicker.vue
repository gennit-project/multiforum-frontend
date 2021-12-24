
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
  <div class="inline-block wide ml-2">
    <Multiselect
      v-model="value"
      mode="tags"
      @select="$emit('setTagFilters', value)"
      @deselect="$emit('setTagFilters', value)"
      :placeholder="'Tags'"
      :closeOnSelect="false"
      :searchable="true"
      :options="formattedTagOptions"
    />
  </div>
</template>


<style src="@vueform/multiselect/themes/default.css">
.wide {
  width: 15em;
}
</style>
