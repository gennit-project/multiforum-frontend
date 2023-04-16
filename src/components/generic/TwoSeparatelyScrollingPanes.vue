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
    <div
      class="flex flex-row"
      :class="{ 
        'container-md': mdAndUp && !lgAndUp && (!route.fullPath.includes('channel')),
        'channel-container-md': mdAndUp && !lgAndUp && (route.fullPath.includes('channel')),
        'container-lg': ( lgAndUp && (!route.fullPath.includes('channel'))), 
        'channel-container-lg': ( lgAndUp && (route.fullPath.includes('channel'))),
        'container-xl': xlAndUp && (!route.fullPath.includes('channel')),
        'channel-container-xl': xlAndUp && (route.fullPath.includes('channel')),}
        "
    >
      <div
        :class="[
          lgAndUp ? 'constrain-height' : '',
          lgAndUp ? 'w-1/2' : 'w-full',
        ]"
        class="lg:overflow-y-auto"
      >
        <slot name="leftpane"></slot>
      </div>
      <div
        v-if="lgAndUp"
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
.channel-container-xl {
  width: 1500px;
}

.container-lg {
  width: 1400px;
}
.channel-container-lg {
  width: 1000px;
}

.container-md {
  width: 1100px;
}
.channel-container-md {
  width: 700px;
}


</style>
