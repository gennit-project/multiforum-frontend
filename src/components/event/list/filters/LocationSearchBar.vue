<script lang="ts">
import { defineComponent } from "vue";
import LocationIcon from "@/components/icons/LocationIcon.vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "LocationSearchBar",
  components: {
    LocationIcon,
  },
  setup() {
    const route = useRoute()
    return {
      route,
    }
  },
  props: {
    compact: {
      type: Boolean,
      default: false,
    },
    searchPlaceholder: {
      type: String,
      default: "",
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
  methods: {
    updateLocationInput(placeData: any) {
      this.$emit("updateLocationInput", placeData);
    },
    requestUserLocation(){
      this.$emit("requestUserLocation");
    }
  },
});
</script>
<template>
  <div
    :class="[fullWidth ? 'w-full' : '', 'inline-block']"
    class="flex mt-2 mb-1 h-12"
  >
    <label for="search" class="sr-only">Search Location</label>
    <div class="relative w-full">
      <div
        v-if="route.name !== 'EditEvent' && route.name !== 'CreateEvent'"
        class="
          absolute
          inset-y-0
          left-0
          pl-3
          flex
          items-center
          pointer-events-none
        "
      >
        <!-- Location icon -->
        <LocationIcon
          class="h-5 w-5 text-gray-400 dark:text-gray-500"
          aria-hidden="true"
        />
      </div>
      <GMapAutocomplete
        autocomplete="false"
        class="
        pl-10
        pr-3
        py-3
        rounded-lg
        leading-5
        dark:bg-gray-700
        dark:text-white
        placeholder-gray-500
        dark:placeholder-gray-400
        dark:border-gray-700
        focus:outline-none
        focus:ring-1
        focus:ring-blue-500
        focus:border-blue-500
        border border-gray-300
        dark:border-gray-700
        text-sm
        w-full
        "
        :placeholder="'Search events near an address'
        "
        disablePortal
        @place_changed="updateLocationInput"
      >
      </GMapAutocomplete>
      <!-- <div
        v-if="route.name !== 'EditEvent' && route.name !== 'CreateEvent'"
        class="
          absolute
          inset-y-0
          right-0
          pr-3
          flex
          items-center
          cursor-pointer
        "
        @click="requestUserLocation"
      >
        <i class="fa-solid fa-crosshairs h-5 w-5 text-gray-400"></i>
      </div> -->
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

