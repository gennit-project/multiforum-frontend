<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
   props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {
    };
  },
  methods: {
    close() {
      this.$emit('update:modelValue', false);
    },
  },
});
</script>

<template>
  <div>
    <v-menu 
      :model-value="modelValue"  
      :close-on-content-click="false"
      location="bottom"
      @update:modelValue="$emit('update:modelValue', $event)"
    >
      <template #activator="{ props }">
        <div v-bind="props">
          <slot
            name="button"
            v-bind="props"
            @close="close"
          />
        </div>
      </template>
      <v-card> <slot name="content" /></v-card>
    </v-menu>
  </div>
</template>

