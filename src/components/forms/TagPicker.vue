
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
      selectedTags: props.value,
      formattedTagOptions,
    };
  },
  props: {
    value: {
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
      v-model="selectedTags"
      class="wide "
      :classes="{
        containerActive: 'ring-0',
        tagsSearch: 'absolute inset-0 border-0 outline-none focus:ring-0 appearance-none p-0 text-base font-sans box-border w-full'
      }"
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

<style lang="scss">
  @import '@vueform/multiselect/themes/tailwind.scss'
</style>
<style>
.wide {
  min-width: 250px;
}
</style>
