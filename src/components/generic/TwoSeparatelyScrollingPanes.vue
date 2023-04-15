<script lang="ts">
import { defineComponent } from "vue";
import { useDisplay } from "vuetify";

export default defineComponent({
  setup() {
    const { lgAndDown, lgAndUp, mdAndDown, mdAndUp, xlAndUp } = useDisplay();

    return {
      lgAndDown,
      lgAndUp,
      mdAndDown,
      mdAndUp,
      xlAndUp,
    };
  },
  components: {},
});
</script>

<template>
    <div
      class="flex flex-row"
      :class="{ 'container-lg': lgAndUp, 'container-md': mdAndUp && !lgAndUp }"
    >
      <div
        :class="[
          lgAndUp ? 'constrain-height' : '',
          mdAndUp ? 'w-1/2' : 'w-full',
        ]"
        class="lg:overflow-y-auto"
      >
        <slot name="leftpane"></slot>
      </div>
      <div
        v-if="mdAndUp"
        :class="[
          'lg:max-h-screen',
          'lg:overflow-y-auto',
          'w-1/2',
        ]"
      >
        <slot name="rightpane"></slot>
      </div>
    </div>
  </template>
  
  <style>
  .constrain-height {
    max-height: 86vh;
    height: 100% - 200px;
  }
  .container-lg {
    width: 100%;
    max-width: 100%;
  }
  .container-md {
    width: 100%;
    max-width: 100%;
  }
  </style>
  

<style>
.constrain-height {
  max-height: 86vh;
  height: 100% - 200px;
}
.container-xl {
  width: 2000px;
}
.container-lg {
  width: 1400px;
}
.container-md {
  width: 1100px;
}


</style>
