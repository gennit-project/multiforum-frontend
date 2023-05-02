<script lang="ts">
import { defineComponent } from "vue";
import { useDisplay } from "vuetify";
import { useRoute } from "vue-router";

export default defineComponent({
  props: {
    showRightPaneAtMediumScreenWidth: {
      type: Boolean,
      default: false,
    }
  },
  setup() {
    const { lgAndDown, lgAndUp, mdAndDown, mdAndUp, xlAndUp } = useDisplay();
    const route = useRoute();

    return {
      lgAndDown,
      lgAndUp,
      mdAndDown,
      mdAndUp,
      xlAndUp,
      route,
    };
  },
  components: {},
});
</script>

<template>
  <v-container fluid class="w-full p-0">
    <v-row class="w-full p-0">
      <v-col
        :class="[
          'p-0',
          lgAndUp ? 'constrain-height' : '',
          mdAndUp ? 'w-1/2' : 'w-full',
        ]"
        class="lg:overflow-y-auto"
      >
        <slot name="leftpane"></slot>
      </v-col>
      <v-col
        v-if="lgAndUp || (mdAndUp && showRightPaneAtMediumScreenWidth)"
        :class="[
          'p-0',
          lgAndUp ? 'constrain-height' : '',
          'lg:max-h-screen',
          'lg:overflow-y-auto',
          'w-1/2',
        ]"
      >
        <slot name="rightpane"></slot>
      </v-col>
    </v-row>
  </v-container>
</template>
  
<style>
.constrain-height {
  max-height: 90vh;
  height: 100% - 200px;
}
</style>