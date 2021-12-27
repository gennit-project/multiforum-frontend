<script lang="ts">
// <ChannelPicker
//         v-if="selectedFilterOptions === 'channelPicker'"
//         :community-options="communityOptions"
//         :selected-communities="selectedCommunities"
//         @pickChannel="pickChannel"
//       />
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
  @deselect="$emit('setChannelFilters', value)"
  :placeholder="'Enter channels here'"
  :closeOnSelect="false"
  :searchable="true"
  :createTag="true"
  :options="channelOptions"
/>
</template>

<style>
.wide {
  min-width: 100px;
}
</style>