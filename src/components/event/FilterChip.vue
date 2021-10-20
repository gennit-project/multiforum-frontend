<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {},
  props: {
      name: {
          type: String,
          required: true
      }
  }
})
</script>

<template>
<div class="mt-2 sm:mt-0 sm:ml-4">
        <div class="-m-1 flex flex-wrap items-center">
          <span
            class="
              m-1
              inline-flex
              rounded-full
              border border-gray-200
              items-center
              py-1.5
              pl-3
              pr-2
              text-sm
              font-medium
              bg-white
              text-gray-900
            "
          >
            <span>{{ name }}</span>
            <button
              type="button"
              class="
                flex-shrink-0
                ml-1
                h-4
                w-4
                p-1
                rounded-full
                inline-flex
                text-gray-400
                hover:bg-gray-200 hover:text-gray-500
              "
            >
              <span class="sr-only">Remove filter for {{ name }}</span>
              <svg
                class="h-2 w-2"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 8 8"
              >
                <path
                  stroke-linecap="round"
                  stroke-width="1.5"
                  d="M1 1l6 6m0-6L1 7"
                />
              </svg>
            </button>
          </span>
        </div>
      </div>
</template>