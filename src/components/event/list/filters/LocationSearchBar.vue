<script lang="ts">
import { defineComponent } from "vue";
import LocationIcon from "@/components/icons/LocationIcon.vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "LocationSearchBar",
  components: {
    LocationIcon,
  },
  props: {
    compact: {
      type: Boolean,
      default: false,
    },
    inTopNav: {
      type: Boolean,
      default: false,
    },
    searchPlaceholder: {
      type: String,
      default: "Search events near an address",
    },
    referencePointAddressName: {
      type: String,
      default: "",
    },
    fullWidth: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const route = useRoute();
    return {
      route,
    };
  },
  methods: {
    updateLocationInput(placeData: any) {
      this.$emit("updateLocationInput", placeData);
    },
    requestUserLocation() {
      this.$emit("requestUserLocation");
    },
  },
});
</script>
<template>
  <div class="flex w-full">
    <label
      for="search"
      class="sr-only"
    >Search Location</label>
    <div class="relative w-full">
      <div
        class="absolute py-2.5 left-0 pl-3 flex items-center pointer-events-none"
      >
        <LocationIcon
          class="h-5 w-5 text-gray-400 dark:text-gray-200"
          aria-hidden="true"
        />
      </div>
      <GMapAutocomplete
        :class="[inTopNav ? 'max-w-sm h-10' : 'rounded-lg h-12 w-full']"
        autocomplete="false"
        class="pl-10 pr-3 leading-5 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-200 dark:placeholder-gray-400 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 border border-gray-300 dark:border-gray-700 text-sm"
        :placeholder="referencePointAddressName"
        disable-portal
        @place_changed="updateLocationInput"
      />
    </div>
  </div>
</template>
<style>
/* Prevent the autocomplete dropdown from rendering behind the popper overly */
.hdpi {
  z-index: 10001;
  min-width: 300px;
}

/* Set minimum width of autocomplete */
.pac-target-input {
  min-width: 400px;
}
</style>
