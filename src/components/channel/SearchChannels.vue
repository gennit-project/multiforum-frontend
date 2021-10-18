<script lang="ts">
import { defineComponent, computed } from "vue";
import Breadcrumbs from '../Breadcrumbs.vue';
import ChannelList from './ChannelList.vue';

export default defineComponent({
  setup() {

    const links = computed(() => {
      return [
        {
          label: "Channels",
          path: "channels"
        }
      ]
    })
    return {
      links
    }
  },
  components: {
      Breadcrumbs,
      ChannelList
  }
});
</script>

<template>
<div class="flex-1 px-10 text-xl font-bold">
    <Breadcrumbs :links="links"/>
    <ChannelList/>
  </div>
</template>