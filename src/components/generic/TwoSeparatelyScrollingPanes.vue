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
        :cols="lgAndUp ? 5 : 6"
        :class="[
          'p-0',
          lgAndUp ? 'constrain-height' : '',
        ]"
        class="lg:overflow-y-auto"
      >
        <slot name="leftpane"></slot>
      </v-col>
      <v-col
        :cols="lgAndUp ? 7 : 6"
        v-if="lgAndUp || (mdAndUp && showRightPaneAtMediumScreenWidth)"
        :class="[
          'p-0',
          lgAndUp ? 'constrain-height' : '',
          'lg:max-h-screen',
          'lg:overflow-y-auto',
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