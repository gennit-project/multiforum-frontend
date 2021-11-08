<script setup lang="ts">
</script>
<template>
  <form>
    <fieldset>
      <legend class="text-base font-medium text-gray-900">
        Filter Events by Location
      </legend>
      <div class="mt-4 space-y-4">
        <div class="flex items-center">
          <input
            id="push-everything"
            name="push-notifications"
            type="radio"
            class="
              focus:ring-indigo-500
              h-4
              w-4
              text-indigo-600
              border
              border-gray-300
            "
          />
          <label
            for="push-everything"
            class="ml-3 block text-sm font-medium text-gray-700"
          >
            Show both virtual and in-person events
          </label>
        </div>
        <div class="flex items-center">
          <input
            id="push-email"
            name="push-notifications"
            type="radio"
            class="
              focus:ring-indigo-500
              h-4
              w-4
              text-indigo-600
              border
              border-gray-300
            "
          />
          <label
            for="push-email"
            class="ml-3 block text-sm font-medium text-gray-700"
          >
            Show only in-person events
          </label>
        </div>
        <div class="flex items-center">
          <input
            id="push-nothing"
            name="push-notifications"
            type="radio"
            class="
              focus:ring-indigo-500
              h-4
              w-4
              text-indigo-600
              border
              border-gray-300
            "
          />
          <label
            for="push-nothing"
            class="ml-3 block text-sm font-medium text-gray-700"
          >
            Show only virtual events
          </label>
        </div>
        <div class="flex items-center">
          <input
            id="push-nothing"
            name="push-notifications"
            type="radio"
            class="
              focus:ring-indigo-500
              h-4
              w-4
              text-indigo-600
              border
              border-gray-300
            "
          />
          <label
            for="push-nothing"
            class="ml-3 block text-sm font-medium text-gray-700"
          >
            Show events within a radius from an address
          </label>
        </div>
        <div class="flex items-center">
          <input
            id="push-nothing"
            name="push-notifications"
            type="radio"
            class="
              focus:ring-indigo-500
              h-4
              w-4
              text-indigo-600
              border
              border-gray-300
            "
          />
          <label
            for="push-nothing"
            class="ml-3 block text-sm font-medium text-gray-700"
          >
            Show events within a city or area
          </label>
        </div>
      </div>
    </fieldset>
  </form>
</template>