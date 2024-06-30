<script lang="ts">
import { defineComponent, ref } from "vue";
import LocationIcon from "@/components/icons/LocationIcon.vue";
import { useRoute } from "vue-router";
import { GoogleAutocomplete } from 'vue3-google-autocomplete'
import config from '@/config'

export default defineComponent({
  name: "LocationSearchBar",
  components: {
    GoogleAutocomplete,
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
      default: "Anywhere",
    },
    referencePointAddressName: {
      type: String,
      default: "",
    },
    fullWidth: {
      type: Boolean,
      default: false,
    },
    leftSideIsRounded: {
      type: Boolean,
      default: true,
    },
    radius: {
      type: String,
      default: ''
    }
  },
  setup() {
    const route = useRoute();
    return {
      config,
      route,
      value: ref(''),
    };
  },
  methods: {
    updateLocationInput(placeData: any) {
      console.log('place data', placeData)
      this.$emit("updateLocationInput", placeData);
      this.value = placeData.formatted_address;
    },
    requestUserLocation() {
      this.$emit("requestUserLocation");
    },
  },
});
</script>
<template>
  <div class="flex-1">
    <label
      for="search"
      class="sr-only"
    >Search Location</label>
    <div class="relative flex items-center">
      <div
        class="absolute py-2.5 left-0 pl-3 flex items-center pointer-events-none"
      >
        <LocationIcon
          class="h-5 w-5 text-gray-400 dark:text-gray-200"
          aria-hidden="true"
        />
      </div>
      <!-- <GMapAutocomplete
        :class="[leftSideIsRounded ? 'rounded-full' : 'rounded-r-full']"
        class="w-full border-gray-200 py-3 pl-10 h-12 pr-3 text-sm leading-5 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        :placeholder=""
        @place_changed="updateLocationInput"
      /> -->
      <GoogleAutocomplete
      :class="[leftSideIsRounded ? 'rounded-full' : 'rounded-r-full']"
        class="w-full flex items-center border-gray-200 py-3 pl-10 h-12 pr-3 text-sm leading-5 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        :value="value"
        :placeholder="searchPlaceholder"
        :api-key="config.googleMapsApiKey"
        :is-full-payload="true"
        @set="updateLocationInput"
      />
      <slot />
    </div>
  </div>
</template>
<style>
/* Prevent the autocomplete dropdown from rendering behind the popper overlay */
.hdpi {
  z-index: 10001;
  min-width: 100px;
}

/* Set minimum width of autocomplete */
.pac-target-input {
  min-width: 100px;
}
</style>
