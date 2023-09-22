<script lang="ts">
import { computed, defineComponent } from "vue";
import TabButton from "@/components/channel/TabButton.vue";
import { useRoute, useRouter } from "vue-router";
import TextButtonDropdown from "@/components/generic/buttons/TextButtonDropdown.vue";

const availableSortTypes: Record<string, string> = {
  HOT: "hot",
  NEW: "new",
  TOP: "top",
};

const sortTypeIcons = {
  hot: "fa-fire",
  new: "fa-burst",
  top: "fa-arrow-up",
};

const topSortTypes = {
  TOP_DAY: "top_day",
  TOP_WEEK: "top_week",
  TOP_MONTH: "top_month",
  TOP_YEAR: "top_year",
  TOP_ALL: "top_all",
};

export default defineComponent({
  name: "SortButtons",
  components: {
    TextButtonDropdown,
    TabButton,
  },
  props: {
    showTopOptions: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const activeSortQuery = computed(() => {
      const sortQuery = route.query.sort;
      if (sortQuery) {
        return sortQuery as string;
      }
      return null;
    });

    const activeTimeFrameQuery = computed(() => {
      const timeFrameQuery = route.query.timeFrame;
      if (timeFrameQuery) {
        return timeFrameQuery as string;
      }
      return null;
    });

    return {
      activeSortQuery,
      activeTimeFrameQuery,
      availableSortTypes,
      route,
      router,
      sortOptions: [
        {
          label: "Hot",
          route: "hot",
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
      sortTypeIcons,
    };
  },
  methods: {
    handleTopSort(value: string) {
      this.router.push({
        query: {
          ...this.route.query,
          timeFrame: value,
        },
      });
    },
  },
});
</script>
<template>
  <div class="flex items-center space-x-4">
    <nav
      class="flex items-center space-x-2 pt-1 text-sm"
      aria-label="Sort Buttons"
    >
      <TabButton
        v-for="sortOption in sortOptions"
        :key="sortOption.value"
        :to="
          router.resolve({ query: { ...route.query, sort: sortOption.route } })
            .href
        "
        :label="sortOption.label"
        :is-active="
          sortOption.value === activeSortQuery ||
          (!activeSortQuery && sortOption.value === availableSortTypes.HOT)
        "
      >
        <i :class="`fa-solid ${sortTypeIcons[sortOption.value]}`"></i>
      </TabButton>
    </nav>
    <TextButtonDropdown
      v-if="showTopOptions && activeSortQuery === availableSortTypes.TOP"
      :label="
        topOptions.find((option) => option.value === activeTimeFrameQuery)
          ?.label || 'Today'
      "
      :items="topOptions"
      @clickedItem="handleTopSort"
    />
  </div>
</template>
