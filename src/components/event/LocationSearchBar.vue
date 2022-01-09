<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "LocationSearchBar",
  setup() {
  },
  props: {
    searchPlaceholder: {
      type: String,
      default: "",
    },
    referencePointAddressName: {
      type: String,
      default: ""
    },
    routerSearchTerms: {
      type: String,
      default: "",
    },
  },
  methods: {
    updateLocationInput(placeData: any) {
      this.$emit("updateLocationInput", placeData);
    },
  },
});
</script>
<template>
  <div class="inline-block">
    <label for="search" class="sr-only">Search Location</label>
    <div class="relative">
      <div
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
        <!-- Heroicon name: solid/search -->
        <svg
          class="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <GMapAutocomplete
        class="
          pl-10
          pr-3
          py-2
          border border-gray-300
          rounded-md
          leading-5
          bg-white
          placeholder-gray-500
          focus:outline-none
          focus:placeholder-gray-400
          focus:ring-1
          focus:ring-indigo-500
          focus:border-indigo-500
          sm:text-sm
        "
        :placeholder="referencePointAddressName || 'Enter an address'"
        disablePortal
        @place_changed="updateLocationInput"
      >
      </GMapAutocomplete>
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

