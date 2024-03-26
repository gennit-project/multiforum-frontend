<script lang="ts">
import { computed, defineComponent } from "vue";
import TabButton from "@/components/channel/TabButton.vue";
import { useRoute, useRouter } from "vue-router";
import TextButtonDropdown from "@/components/generic/buttons/TextButtonDropdown.vue";
import {
  getSortFromQuery,
  getTimeFrameFromQuery,
  availableSortTypes,
  sortTypeIcons,
  topSortTypes,
  capitalizeCase,
} from "@/components/comments/getSortFromQuery";

const topOptions = [
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
];
const sortOptions = [
  {
    label: "Hot",
    value: availableSortTypes.HOT,
  },
  {
    label: "New",
    value: availableSortTypes.NEW,
  },
  {
    label: "Top",
    value: availableSortTypes.TOP,
  },
];

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
      return getSortFromQuery(route.query);
    });

    const activeTimeFrameQuery = computed(() => {
      return getTimeFrameFromQuery(route.query);
    });

    const activeTimeFrameLabel = computed(() => {
      return capitalizeCase(activeTimeFrameQuery.value);
    });

    return {
      activeSortQuery,
      activeTimeFrameLabel,
      activeTimeFrameQuery,
      availableSortTypes,
      capitalizeCase,
      route,
      router,
      sortOptions,
      topOptions,
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
  <div class="flex items-center space-x-4 border-b dark:border-b-gray-600">
    <nav
      class="flex items-center space-x-2 pt-1 text-sm"
      aria-label="Sort Buttons"
    >
      <TabButton
        v-for="sortOption in sortOptions"
        :key="sortOption.value"
        :to="
          router.resolve({ query: { ...route.query, sort: sortOption.value } })
            .href
        "
        :label="capitalizeCase(sortOption.label)"
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
      :label="activeTimeFrameLabel"
      :items="topOptions"
      @clickedItem="handleTopSort"
    />
  </div>
</template>
