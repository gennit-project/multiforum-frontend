<script lang="ts">
import { defineComponent, computed } from "vue";
import Breadcrumbs from '../Breadcrumbs.vue';
import ChannelList from './ChannelList.vue';
import { GET_COMMUNITIES } from '@/graphQLData/community/queries';


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
      links,
    }
  },
  data() {
    return {
      queryCommunity: []
    }
  },
  components: {
      Breadcrumbs,
      ChannelList
  },
  apollo: {
    queryCommunity: GET_COMMUNITIES
  }
});
</script>

<template>
<div class="flex-1 px-10 text-xl font-bold">
    <Breadcrumbs :links="links"/>
    <ChannelList :channels="queryCommunity"/>
  </div>
</template>