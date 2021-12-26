<script lang="ts">
import { defineComponent, PropType, reactive, computed } from "vue";
import AddToFeed from "@/components/buttons/AddToFeed.vue";
import LocationMenu from "@/components/event/LocationMenu.vue";
import DateMenu from "@/components/event/DateMenu.vue";
import FilterChip from "@/components/forms/FilterChip.vue";

export default defineComponent({
  setup(props) {
    const channelLabel = computed(() => {
      if (props.selectedChannels.length > 0) {
        const channelString = props.selectedChannels.join(", ");
        return `Channels: ${channelString}`;
      }
      return "Channels";
    });

    const tagLabel = computed(() => {
      if (props.selectedTags.length > 0) {
        const tagString = props.selectedTags.join(", ");
        return `Tags: ${tagString}`;
      }
      return "Tags";
    });

    const filterOptions = reactive({
      weeklyTimes: {
        label: "Weekday & Time",
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
        label: "Cost",
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
    tagOptions: {
      type: Array as PropType<string[]>,
      default: () => {
        return [];
      },
    },
  },
  components: {
    LocationMenu,
    AddToFeed,
    DateMenu,
    FilterChip,
  },
});
</script>

<template>
    <div class="py-3 px-3 inline-block">
      <slot />
      <DateMenu />
      <LocationMenu />
      <FilterChip
        :key="filter"
        v-for="filter in applicableFilters"
        :name="filterOptions[filter].label"
        @click="$emit('openModal', filterOptions[filter].modalType)"
      >
      </FilterChip>
      <AddToFeed v-if="channelId" />
    </div>
</template>
