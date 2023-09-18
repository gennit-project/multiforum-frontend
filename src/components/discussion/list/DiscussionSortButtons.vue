<script lang="ts">
import { defineComponent } from "vue";
import TabButton from "@/components/channel/TabButton.vue";
import { useRoute } from "vue-router";
import IconButtonDropdown from "@/components/generic/buttons/IconButtonDropdown.vue";

const availableSortTypes = {
  HOT: "HOT",
  NEW: "NEW",
  TOP: "TOP",
};

const topSortTypes = {
  TOP_DAY: "TOP_DAY",
  TOP_WEEK: "TOP_WEEK",
  TOP_MONTH: "TOP_MONTH",
  TOP_YEAR: "TOP_YEAR",
  TOP_ALL: "TOP_ALL",
};

export default defineComponent({
  name: "SortButtons",
  components: {
    IconButtonDropdown,
    TabButton,
  },
  setup() {
    const route = useRoute();
    return {
      route,
      sortOptions: [
        {
          label: "Hot",
          route: "",
          value: availableSortTypes.HOT,
        },
        {
          label: "New",
          route: "new",
          value: availableSortTypes.NEW,
        },
        {
          label: "Top",
          route: "top",
          value: availableSortTypes.TOP,
        },
      ],
      topOptions: [
        {
          label: "Day",
          value: topSortTypes.TOP_DAY,
        },
        {
          label: "Week",
          value: topSortTypes.TOP_WEEK,
        },
        {
          label: "Month",
          value: topSortTypes.TOP_MONTH,
        },
        {
          label: "Year",
          value: topSortTypes.TOP_YEAR,
        },
        {
          label: "All Time",
          value: topSortTypes.TOP_ALL,
        },
      ],
    };
  },
});
</script>
<template>
  <nav class="space-x-2 pt-1 text-sm" aria-label="Sort Buttons">
    <TabButton
      :to="`/channels/c/${route.params.channelId}/discussions`"
      :label="'Hot'"
      :is-active="!$route.path.includes('new') && !$route.path.includes('top')"
    />
    <TabButton
      :to="`/channels/c/${route.params.channelId}/discussions/search/new`"
      :label="'New'"
      :is-active="$route.path.includes('new')"
    />
    <TabButton
      :to="`/channels/c/${route.params.channelId}/discussions/search/top`"
      :label="'Top'"
      :is-active="$route.path.includes('top')"
    />
    <IconButtonDropdown
      :menu-button-icon="'fa-regular fa-sun'"
      :items="[
        {
          label: 'Light Mode',
          icon: 'fa-regular fa-sun',
          event: 'lightMode',
          value: '',
        },
        {
          label: 'Dark Mode',
          icon: 'fa-regular fa-moon',
          event: 'darkMode',
          value: '',
        },
        {
          label: 'Device Default',
          icon: 'fa-solid fa-desktop',
          event: 'systemMode',
          value: '',
        },
      ]"
    />
  </nav>
</template>
