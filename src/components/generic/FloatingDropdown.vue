<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({

  setup() {
    const showMenu = ref(false);

    const handleClick = (event: MouseEvent) => {
      event.preventDefault();
      showMenu.value = true;
    };

    return {
      showMenu,
      handleClick,
    };
  },
});
</script>

<template>
<div>
  <v-menu 
    v-model="showMenu"  
    :close-on-content-click="false"
    location="bottom"
  >
    <template v-slot:activator="{ props }">
      <div v-bind="props">
        <slot name="button" v-bind="props" />
      </div>
      
    </template>
    <v-card> <slot name="content"></slot></v-card>
   
  </v-menu>
</div>
</template>

