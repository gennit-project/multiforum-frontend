<script lang="ts">
// <ChannelPicker
//         v-if="selectedFilterOptions === 'channelPicker'"
//         :community-options="communityOptions"
//         :selected-communities="selectedCommunities"
//         @pickChannel="pickChannel"
//       />
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
    <h1>Filter by Channels</h1>
    <Multiselect
      v-model="value"
      mode="tags"
      @select="$emit('setChannelFilters', value)"
      @deselect="$emit('setChannelFilters', value)"
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