<script lang="ts">
import { defineComponent, PropType, reactive, computed } from "vue";
import FilterChip from "@/components/forms/FilterChip.vue";
import SearchBar from "@/components/forms/SearchBar.vue";
import AddToFeed from "@/components/buttons/AddToFeed.vue";

export default defineComponent({
  setup(props) {
    const channelLabel = computed(() => {
      if (props.selectedChannels.length > 0) {
        const channelString = props.selectedChannels.join(", ");
        return `Channels: ${channelString}`;
      }
      return "Any channels";
    });

    const tagLabel = computed(() => {
      if (props.selectedTags.length > 0) {
        const tagString = props.selectedTags.join(", ");
        return `Tags: ${tagString}`;
      }
      return "Any tags";
    });

    const filterOptions = reactive({
      dateRange: {
        label: "In the next month",
        modalType: "datePicker",
      },
      location: {
        label: "Any location",
        modalType: "typePicker",
      },
      weeklyTimes: {
        label: "Any time on any weekday",
        modalType: "weeklyTimePicker",
      },
      channels: {
        label: channelLabel,
        modalType: "channelPicker",
      },
      tags: {
        label: tagLabel,
        modalType: "tagPicker",
      },
      cost: {
        label: "Any cost",
        modalType: "costPicker",
      },
    });

    return {
      filterOptions,
    };
  },
  props: {
    applicableFilters: {
      type: Array as PropType<string[]>,
      required: true,
    },
    channelId: {
      type: String,
      default: "",
    },
    searchPlaceholder: {
      type: String,
      default: "",
    },
    selectedTags: {
      type: Array as PropType<string[]>,
      default: () => {
        return [];
      },
    },
    selectedChannels: {
      type: Array as PropType<string[]>,
      default: () => {
        return [];
      },
    },
    routerSearchTerms: {
      type: String,
      default: ""
    }
  },
  components: {
    FilterChip,
    SearchBar,
    AddToFeed,
  },
  methods: {
    updateSearchInput(input: string) {
      this.$emit('updateSearchInput', input)
    }
  }
});
</script>

<template>
  <div>
    <div class="text-lg py-3 px-8">
      <h3
        class="
          text-xs
          font-semibold
          uppercase
          text-gray-500
          inline-block
        "
      >
        <SearchBar
          :router-search-terms="routerSearchTerms"
          :search-placeholder="searchPlaceholder"
          @updateSearchInput="updateSearchInput"
        />
      </h3>
      <div class="inline-block">
        <FilterChip
          :key="filter"
          v-for="filter in applicableFilters"
          :name="filterOptions[filter].label"
          @click="$emit('openModal', filterOptions[filter].modalType)"
        >
        </FilterChip>
        <AddToFeed v-if="channelId" />
      </div>
    </div>
  </div>
</template>