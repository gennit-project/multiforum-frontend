<script lang="ts">
import { defineComponent } from "vue";
import { useDisplay } from "vuetify";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
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
  <v-container fluid>
    <v-row>
      <v-col
        :class="[
          lgAndUp ? 'constrain-height' : '',
          xlAndUp ? 'w-1/2' : 'w-full',
        ]"
        class="lg:overflow-y-auto"
      >
        <slot name="leftpane"></slot>
      </v-col>
      <v-col
        v-if="lgAndUp"
        :class="[
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
  max-height: 86vh;
  height: 100% - 200px;
}
</style>