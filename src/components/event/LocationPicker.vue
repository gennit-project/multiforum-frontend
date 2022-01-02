<script lang="ts">
import { defineComponent, ref } from "vue";
import locationFilterTypes from "../event/locationFilterTypes";
import { distanceOptions, distanceUnitOptions } from "./eventSearchOptions";
import Select from "@/components/forms/Select.vue";
import RadioButtons from "@/components/forms/RadioButtons.vue";
import LocationSearchBar from "@/components/event/LocationSearchBar.vue";
import { locationFilterOptions } from "./eventSearchOptions";
import { DistanceUnit, Distance } from "@/types/eventTypes";

export default defineComponent({
  components: {
    Select,
    RadioButtons,
    LocationSearchBar,
  },
  setup(props) {
    const defaultDistanceUnit: DistanceUnit = { label: "km", value: "km" };
    const locationFilter = ref(props.selectedLocationFilter);
    const selectedDistanceUnit = ref(defaultDistanceUnit);

    const getDistanceOptions = (label: string) => {
      return distanceOptions.map((option) => {
        return {
          ...option,
          label: `${option[label].toLocaleString()} ${label}`,
        };
      });
    };

    const unitLabel = selectedDistanceUnit.value.label.toString();

    const distanceOptionsWithLabel: any = ref(getDistanceOptions(unitLabel));

    const selectedDistance = ref({ ...distanceOptionsWithLabel.value[0] });

    const selectedLocationFilterOption = ref(locationFilterOptions[0])

    return {
      getDistanceOptions,
      locationFilterOptions,
      locationFilterTypes,
      locationFilter,
      distanceOptions,
      distanceUnitOptions,
      distanceOptionsWithLabel,
      selectedDistance,
      selectedDistanceUnit,
      selectedLocationFilterOption
    };
  },
  props: {
    selectedLocationFilter: {
      type: String,
      required: true,
    },
  },
  methods: {
    updateLocationInput(placeData: any) {
      this.$emit("updateLocationInput", placeData);
    },
    updateSelectedDistanceUnit(unitOption: DistanceUnit) {
      this.selectedDistanceUnit = unitOption;
      this.distanceOptionsWithLabel = this.getDistanceOptions(unitOption.label);
      this.selectedDistance.label = `${
        this.selectedDistance[unitOption.label].toLocaleString()
      } ${unitOption.label}`;
    },
    updateSelectedDistance(radius: Distance) {
      this.selectedDistance = radius;
    },
  },
});
</script>

<template>
  <div>
    <RadioButtons
      :selected-option="selectedLocationFilterOption"
      :options="locationFilterOptions"
      @change="$emit('updateLocationFilter', selectedLocationFilter)"
    />
    <div
      id="radiusOptions"
      class="ml-7 mt-2"
     
    >
      <label class="block text-xs font-medium text-gray-700 mt-2"
        >Near this Address</label
      >
      <LocationSearchBar
        :search-placeholder="'Address'"
        @updateLocationInput="updateLocationInput"
      />
      <Select
        :select-label="'Within Radius'"
        :selected-option="selectedDistance"
        :options="distanceOptionsWithLabel"
        @updateSelected="updateSelectedDistance"
      />
      <Select
        :select-label="'Distance Unit'"
        :selected-option="selectedDistanceUnit"
        :options="distanceUnitOptions"
        @updateSelected="updateSelectedDistanceUnit"
      />
    </div>
  </div>
</template>