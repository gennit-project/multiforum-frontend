<script lang="ts">
import { defineComponent, PropType } from "vue";

interface Link {
  path: string
  label: string
}

export default defineComponent({
  setup() {

  },
  props: {
    links: {
      type: Array as PropType<Link[]>,
    }
  },
});
</script>

<template>
  <nav class="flex mt-4 mb-4" aria-label="Breadcrumb">
    <ol role="list" class="flex items-center space-x-4">
      <li>
        <div>
          <router-link :to="`/`" class="text-gray-400 hover:text-gray-500">
            <!-- Heroicon name: solid/home -->
            <svg
              class="flex-shrink-0 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
              />
            </svg>
           
              <span class="sr-only">Home</span>
            </router-link>
          
        </div>
      </li>
      <li v-for="link in links" :key="link.path">
        <div class="flex items-center">
          <!-- Heroicon name: solid/chevron-right -->
          <svg
            class="flex-shrink-0 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <router-link
            v-if="link.path"
            :to="`/${link.path}/`"
            class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
            active-class="text-gray-700"
            >{{ link.label }}
          </router-link>
        </div>
      </li>
    </ol>
  </nav>
</template>
