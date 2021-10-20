<script lang="ts">
import { defineComponent } from "vue";
import ActiveFilters from "./ActiveFilters.vue";
import ToggleMap from "../buttons/ToggleMap.vue";
import SortDropdown from "./SortDropdown.vue";
import SearchBar from "./SearchBar.vue";

export default defineComponent({
  setup() {},
  components: {
    ActiveFilters,
    ToggleMap,
    SortDropdown,
    SearchBar,
  },
});
</script>
<template>
  <div class="bg-white">
    <div class="col-start-1 row-start-1 py-4">
      <div class="mx-auto py-3 px-4 sm:flex sm:items-center sm:px-6 lg:px-8">
        <div >
          <SearchBar />
        </div>

        <div class="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
          <ToggleMap />
          <SortDropdown class="mx-8 float-right" />
        </div>
      </div>
    </div>

    <ActiveFilters />

    <!-- Filters -->
    <section
      aria-labelledby="filter-heading"
      class="relative z-10 border-t border-b border-gray-200 grid items-center"
    >
      <h2 id="filter-heading" class="sr-only">Filters</h2>
      <div class="relative col-start-1 row-start-1 py-4">
        <div
          class="
            max-w-7xl
            mx-auto
            flex
            space-x-6
            divide-x divide-gray-200
            text-sm
            px-4
            sm:px-6
            lg:px-8
          "
        ></div>
      </div>
      <div class="border-t border-gray-200 py-10" id="disclosure-1">
        <div
          class="
            max-w-7xl
            mx-auto
            grid grid-cols-2
            gap-x-4
            px-4
            text-sm
            sm:px-6
            md:gap-x-6
            lg:px-8
          "
        >
          <div
            class="
              grid grid-cols-1
              gap-y-10
              auto-rows-min
              md:grid-cols-2 md:gap-x-6
            "
          >
            <fieldset>
              <legend class="block font-medium">Price</legend>
              <div class="pt-6 space-y-6 sm:pt-4 sm:space-y-4">
                <div class="flex items-center text-base sm:text-sm">
                  <input
                    id="price-0"
                    name="price[]"
                    value="0"
                    type="checkbox"
                    class="
                      flex-shrink-0
                      h-4
                      w-4
                      border-gray-300
                      rounded
                      text-indigo-600
                      focus:ring-indigo-500
                    "
                  />
                  <label
                    for="price-0"
                    class="ml-3 min-w-0 flex-1 text-gray-600"
                  >
                    $0 - $25
                  </label>
                </div>

                <div class="flex items-center text-base sm:text-sm">
                  <input
                    id="price-1"
                    name="price[]"
                    value="25"
                    type="checkbox"
                    class="
                      flex-shrink-0
                      h-4
                      w-4
                      border-gray-300
                      rounded
                      text-indigo-600
                      focus:ring-indigo-500
                    "
                  />
                  <label
                    for="price-1"
                    class="ml-3 min-w-0 flex-1 text-gray-600"
                  >
                    $25 - $50
                  </label>
                </div>

                <div class="flex items-center text-base sm:text-sm">
                  <input
                    id="price-2"
                    name="price[]"
                    value="50"
                    type="checkbox"
                    class="
                      flex-shrink-0
                      h-4
                      w-4
                      border-gray-300
                      rounded
                      text-indigo-600
                      focus:ring-indigo-500
                    "
                  />
                  <label
                    for="price-2"
                    class="ml-3 min-w-0 flex-1 text-gray-600"
                  >
                    $50 - $75
                  </label>
                </div>

                <div class="flex items-center text-base sm:text-sm">
                  <input
                    id="price-3"
                    name="price[]"
                    value="75"
                    type="checkbox"
                    class="
                      flex-shrink-0
                      h-4
                      w-4
                      border-gray-300
                      rounded
                      text-indigo-600
                      focus:ring-indigo-500
                    "
                  />
                  <label
                    for="price-3"
                    class="ml-3 min-w-0 flex-1 text-gray-600"
                  >
                    $75+
                  </label>
                </div>
              </div>
            </fieldset>
            <fieldset>
              <legend class="block font-medium">Color</legend>
              <div class="pt-6 space-y-6 sm:pt-4 sm:space-y-4">
                <div class="flex items-center text-base sm:text-sm">
                  <input
                    id="color-0"
                    name="color[]"
                    value="white"
                    type="checkbox"
                    class="
                      flex-shrink-0
                      h-4
                      w-4
                      border-gray-300
                      rounded
                      text-indigo-600
                      focus:ring-indigo-500
                    "
                  />
                  <label
                    for="color-0"
                    class="ml-3 min-w-0 flex-1 text-gray-600"
                  >
                    White
                  </label>
                </div>

                <div class="flex items-center text-base sm:text-sm">
                  <input
                    id="color-1"
                    name="color[]"
                    value="beige"
                    type="checkbox"
                    class="
                      flex-shrink-0
                      h-4
                      w-4
                      border-gray-300
                      rounded
                      text-indigo-600
                      focus:ring-indigo-500
                    "
                  />
                  <label
                    for="color-1"
                    class="ml-3 min-w-0 flex-1 text-gray-600"
                  >
                    Beige
                  </label>
                </div>

                <div class="flex items-center text-base sm:text-sm">
                  <input
                    id="color-2"
                    name="color[]"
                    value="blue"
                    type="checkbox"
                    class="
                      flex-shrink-0
                      h-4
                      w-4
                      border-gray-300
                      rounded
                      text-indigo-600
                      focus:ring-indigo-500
                    "
                    checked
                  />
                  <label
                    for="color-2"
                    class="ml-3 min-w-0 flex-1 text-gray-600"
                  >
                    Blue
                  </label>
                </div>

                <div class="flex items-center text-base sm:text-sm">
                  <input
                    id="color-3"
                    name="color[]"
                    value="brown"
                    type="checkbox"
                    class="
                      flex-shrink-0
                      h-4
                      w-4
                      border-gray-300
                      rounded
                      text-indigo-600
                      focus:ring-indigo-500
                    "
                  />
                  <label
                    for="color-3"
                    class="ml-3 min-w-0 flex-1 text-gray-600"
                  >
                    Brown
                  </label>
                </div>

                <div class="flex items-center text-base sm:text-sm">
                  <input
                    id="color-4"
                    name="color[]"
                    value="green"
                    type="checkbox"
                    class="
                      flex-shrink-0
                      h-4
                      w-4
                      border-gray-300
                      rounded
                      text-indigo-600
                      focus:ring-indigo-500
                    "
                  />
                  <label
                    for="color-4"
                    class="ml-3 min-w-0 flex-1 text-gray-600"
                  >
                    Green
                  </label>
                </div>

                <div class="flex items-center text-base sm:text-sm">
                  <input
                    id="color-5"
                    name="color[]"
                    value="purple"
                    type="checkbox"
                    class="
                      flex-shrink-0
                      h-4
                      w-4
                      border-gray-300
                      rounded
                      text-indigo-600
                      focus:ring-indigo-500
                    "
                  />
                  <label
                    for="color-5"
                    class="ml-3 min-w-0 flex-1 text-gray-600"
                  >
                    Purple
                  </label>
                </div>
              </div>
            </fieldset>
          </div>
          <div
            class="
              grid grid-cols-1
              gap-y-10
              auto-rows-min
              md:grid-cols-2 md:gap-x-6
            "
          >
            <fieldset>
              <legend class="block font-medium">Size</legend>
              <div class="pt-6 space-y-6 sm:pt-4 sm:space-y-4">
                <div class="flex items-center text-base sm:text-sm">
                  <input
                    id="size-0"
                    name="size[]"
                    value="xs"
                    type="checkbox"
                    class="
                      flex-shrink-0
                      h-4
                      w-4
                      border-gray-300
                      rounded
                      text-indigo-600
                      focus:ring-indigo-500
                    "
                  />
                  <label for="size-0" class="ml-3 min-w-0 flex-1 text-gray-600">
                    XS
                  </label>
                </div>

                <div class="flex items-center text-base sm:text-sm">
                  <input
                    id="size-1"
                    name="size[]"
                    value="s"
                    type="checkbox"
                    class="
                      flex-shrink-0
                      h-4
                      w-4
                      border-gray-300
                      rounded
                      text-indigo-600
                      focus:ring-indigo-500
                    "
                    checked
                  />
                  <label for="size-1" class="ml-3 min-w-0 flex-1 text-gray-600">
                    S
                  </label>
                </div>

                <div class="flex items-center text-base sm:text-sm">
                  <input
                    id="size-2"
                    name="size[]"
                    value="m"
                    type="checkbox"
                    class="
                      flex-shrink-0
                      h-4
                      w-4
                      border-gray-300
                      rounded
                      text-indigo-600
                      focus:ring-indigo-500
                    "
                  />
                  <label for="size-2" class="ml-3 min-w-0 flex-1 text-gray-600">
                    M
                  </label>
                </div>

                <div class="flex items-center text-base sm:text-sm">
                  <input
                    id="size-3"
                    name="size[]"
                    value="l"
                    type="checkbox"
                    class="
                      flex-shrink-0
                      h-4
                      w-4
                      border-gray-300
                      rounded
                      text-indigo-600
                      focus:ring-indigo-500
                    "
                  />
                  <label for="size-3" class="ml-3 min-w-0 flex-1 text-gray-600">
                    L
                  </label>
                </div>

                <div class="flex items-center text-base sm:text-sm">
                  <input
                    id="size-4"
                    name="size[]"
                    value="xl"
                    type="checkbox"
                    class="
                      flex-shrink-0
                      h-4
                      w-4
                      border-gray-300
                      rounded
                      text-indigo-600
                      focus:ring-indigo-500
                    "
                  />
                  <label for="size-4" class="ml-3 min-w-0 flex-1 text-gray-600">
                    XL
                  </label>
                </div>

                <div class="flex items-center text-base sm:text-sm">
                  <input
                    id="size-5"
                    name="size[]"
                    value="2xl"
                    type="checkbox"
                    class="
                      flex-shrink-0
                      h-4
                      w-4
                      border-gray-300
                      rounded
                      text-indigo-600
                      focus:ring-indigo-500
                    "
                  />
                  <label for="size-5" class="ml-3 min-w-0 flex-1 text-gray-600">
                    2XL
                  </label>
                </div>
              </div>
            </fieldset>
            <fieldset>
              <legend class="block font-medium">Channels</legend>
            </fieldset>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>