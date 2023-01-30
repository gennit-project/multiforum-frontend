<script lang="ts">
import { defineComponent } from "vue";
import SearchEvents from "./SearchEvents.vue";

export default defineComponent({
  name: "EventTab",
  components: {
    SearchEvents
  },
  setup() {
    // The main reason I have this component is so the event
    // tab in a channel will be marked active for the search
    // event component AND the event detail component.
    // They need to both be children of the same route in the router
    // in order for the event tab to be active for both.
    // Hence this dummy component.
  },
});
</script>

<template>
  <SearchEvents/>
</template>
