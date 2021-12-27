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
      value: props.selectedChannels,
    };
  },
  props: {
    selectedChannels: {
      type: Array as PropType<string[]>,
      default: () => {
        return [];
      },
    },
    channelOptions: {
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
  class="wide"
  v-model="value"
  mode="tags"
  @select="$emit('setChannelFilters', value)"
  @deselect="$emit('setChannelFilters', [])"
  @clear="$emit('setChannelFilters', [])"
  :placeholder="'Enter channels here'"
  :closeOnSelect="false"
  :searchable="true"
  :options="channelOptions"
/>
</template>
<style src="@vueform/multiselect/themes/default.css"></style>
<style>
.wide {
  min-width: 250px;
}
</style>