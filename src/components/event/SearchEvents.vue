<script lang="ts">
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";
import EventList from "./EventList.vue";
import AddToFeed from "../buttons/AddToFeed.vue";
import FlyoverMenu from "../buttons/FlyoverMenu.vue";
import ActiveFilters from "../ActiveFilters.vue";
import ToggleMap from "../buttons/ToggleMap.vue";
import Map from "./Map.vue";

export default defineComponent({
  setup() {
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId;
    });

    return {
      channelId,
    };
  },
  data() {
    return {
      showMap: true,
    };
  },
  components: {
    EventList,
    AddToFeed,
    FlyoverMenu,
    ActiveFilters,
    ToggleMap,
    Map,
  },
});
</script>

<template>
  <div class="flex-1 text-xl font-bold">
    <div class="px-10">
      <ActiveFilters />
      
    </div>
    <div class="space-x-1">
        <AddToFeed v-if="channelId" />
        <FlyoverMenu :name="'Place'" />
        <FlyoverMenu :name="'Date'" />
        <FlyoverMenu :name="'Time Range'" />
        <FlyoverMenu v-if="!channelId" :name="'Community'" />
        <FlyoverMenu :name="'Tag'" />
        <FlyoverMenu :name="'Other Filters'" />
        <ToggleMap
          :show-map="showMap"
          @showMap="showMap = true"
          @showList="showMap = false"
        />
      </div>
    <Map v-if="showMap" />
    <EventList v-if="!showMap" />
  </div>
</template>
