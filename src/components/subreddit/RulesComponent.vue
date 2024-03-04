<script lang="ts">
import { defineComponent, ref, PropType } from "vue";
import MarkdownPreview from "@/components/generic/forms/MarkdownPreview.vue";

type Rule = {
  short_name: string;
  description: string;
};

export default defineComponent({
  name: "RulesComponent",
  components: {
    MarkdownPreview,
  },
  props: {
    rules: {
      type: Array as PropType<Rule[]>,
      default: () => [],
    },
  },
  setup() {
    return {
      openRules: ref([]),
    };
  },
  methods: {
    toggleRule(ruleName: string) {
      const index = this.openRules.indexOf(ruleName);
      if (index > -1) {
        this.openRules.splice(index, 1); // Remove rule name from array if it's already there (collapse the panel)
      } else {
        this.openRules.push(ruleName); // Add rule name to array to expand the panel
      }
    },
    isOpen(ruleName: string) {
      return this.openRules.includes(ruleName);
    },
  },
});
</script>

<template>
  <div class="divide-y">
    <div
      v-for="rule in rules"
      :key="rule.short_name"
      class="my-2 cursor-pointer pt-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
      @click="
        () => {
          if (rule.description) {
            toggleRule(rule.short_name);
          }
        }
      "
    >
      <div class="flex items-center font-bold">
        {{ rule.short_name }}
        <i
          v-if="rule.description"
          :class="[
            'fa-solid',
            'h-3',
            'w-3',
            'text-xs',
            isOpen(rule.short_name) ? 'fa-chevron-up' : 'fa-chevron-down',
            'ml-2',
          ]"
        />
      </div>
      <div
        v-if="isOpen(rule.short_name)"
        class="-ml-6 mt-2 text-sm text-gray-600 dark:text-gray-300"
      >
        <MarkdownPreview :text="rule.description" />
      </div>
    </div>
  </div>
</template>
