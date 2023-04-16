<script>
import { defineComponent, ref } from "vue";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon.vue";

export default defineComponent({
  components: {
    ChevronDownIcon,
  },
  setup() {
    return { showMenu: ref(false) };
  },
  props: {
    label: {
      type: String,
      default: "No label",
    },
    highlighted: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<template>
  <div class="inline-flex items-center">
    <v-menu
      v-model="showMenu"
      :close-on-content-click="false"
      location="bottom"
    >
      <template v-slot:activator="{ props }">
        <div v-bind="props">
          <button
            :class="[highlighted ? 'ring-1 ring-blue-500 border-blue-500' : '']"
            class="bg-white inline-flex max-height-3 px-3.5 py-2.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 dark:bg-slate-700 text-gray-700 dark:text-gray-200  dark:bg-gray-700 hover:bg-gray-50 whitespace-nowrap focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <slot name="icon"></slot>

            {{ label }}
            <ChevronDownIcon
              class="-mr-1 ml-1 mt-0.5 h-3 w-3"
              aria-hidden="true"
            />
          </button>
        </div>
      </template>
      <v-card> <slot name="content"></slot></v-card>
    </v-menu>
  </div>
</template>
