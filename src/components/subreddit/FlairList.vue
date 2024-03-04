<script lang="ts">
import { useRoute } from "vue-router";
import { defineComponent, computed, ref, PropType } from "vue";

export default defineComponent({
  name: "FlairList",
  props: {
    flairs: {
      type: Array as PropType<{ text: string }[]>,
      default: () => [],
    },
  },
  setup() {
    const route = ref(useRoute());

    const subredditName = computed(() => {
      if (typeof route.value.params.subredditName !== "string") {
        return "";
      }
      return route.value.params.subredditName;
    });

    const flairInQuery = computed(() => {
      if (typeof route.value.query.flair !== "string") {
        return "";
      }
      return route.value.query.flair;
    }); 

    return {
      flairInQuery,
      route,
      subredditName,
    };
  },
  methods: {
    handleClickFlair(flair: string) {
      // Update the flair in the query params
      const existingQuery = this.$route.query;

      // Check if the flair is already in the query
        if (flair === this.flairInQuery) {
            // If it is, remove it
            const newQuery = { ...existingQuery };
            delete newQuery.flair;
            this.$router.replace({
                query: newQuery,
            });
        } else {
            // If it isn't, add it.
            // Updating the URL params causes the events
            // to be refetched by the EventListView
            // and MapView components
            this.$router.replace({
                query: {
                ...existingQuery,
                ...{ flair },
                },
            });
        }

      
    },
  },
});
</script>

<template>
  <div class="flex flex-wrap items-center">
    <span
      v-for="flair in flairs"
      :key="flair.text"
      :class="[
        flairInQuery === flair.text
          ? 'bg-black text-white dark:bg-white dark:text-black'
          : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 dark:hover:text-white',
      ]"
      class="mr-2 mt-1 cursor-pointer rounded-full  px-2 py-1  "
      @click="handleClickFlair(flair.text)"
    >
      {{ flair.text }}
    </span>
  </div>
</template>
