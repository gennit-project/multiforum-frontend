<script lang="ts">
import { defineComponent } from "vue";
import { weekdays, hourRangesData } from "./eventSearchOptions";

export default defineComponent({
  setup() {
    return {
      weekdays,
      hourRangesData,
    };
  },
});
</script>
<template>
  <form>
    <legend class="text-base font-medium text-gray-900">
      Filter Events by Weekday and Time
    </legend>
    <div class="flex flex-col">
      <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="py-2 align-middle inline-block sm:px-6 lg:px-8">
          <div
            class="
              shadow
              overflow-hidden
              border-b border-gray-400
              sm:rounded-lg
            "
          >
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="
                      px-6
                      py-3
                      text-left text-xs
                      font-medium
                      text-gray-500
                      uppercase
                      tracking-wider
                    "
                  >
                    Time Range
                  </th>
                  <th
                    v-for="weekday in weekdays"
                    :key="weekday.shortName"
                    scope="col"
                    class="
                      px-6
                      py-3
                      text-left text-xs
                      font-medium
                      text-gray-500
                      uppercase
                      tracking-wider
                    "
                  >
                    <div class="inline-block items-center h-5">
                      <input
                        id="comments"
                        aria-describedby="comments-description"
                        name="comments"
                        type="checkbox"
                        class="
                          focus:ring-indigo-500
                          h-4
                          w-4
                          text-indigo-600
                          border-gray-400
                          rounded
                        "
                      />
                    </div>
                    {{ weekday.shortName }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  class="bg-white"
                  :key="range['12-hour-label']"
                  v-for="range in hourRangesData"
                >
                  <td
                    class="
                      px-6
                      py-4
                      whitespace-nowrap
                      text-left text-sm
                      font-medium
                      text-gray-900
                    "
                  >
                    <div class="inline-block items-center h-5">
                      <input
                        type="checkbox"
                        class="
                          focus:ring-indigo-500
                          h-4
                          w-4
                          text-indigo-600
                          border-gray-400
                          rounded
                        "
                      />
                    </div>
                    {{ range["12-hour-label"] }}
                  </td>
                  <td
                    :key="weekday.number"
                    v-for="weekday in weekdays"
                    class="
                      px-6
                      py-4
                      text-left
                      whitespace-nowrap
                      text-sm text-gray-500
                    "
                  >
                    <div class="flex items-center h-5">
                      <input
                        type="checkbox"
                        class="
                          focus:ring-indigo-500
                          h-4
                          w-4
                          text-indigo-600
                          border-gray-400
                          rounded
                        "
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>