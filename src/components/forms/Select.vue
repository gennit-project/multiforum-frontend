<script lang="ts">
import { defineComponent, ref, PropType } from "vue";
import ListboxButton from "@/components/forms/ListboxButton.vue";
import { Listbox, ListboxOption, ListboxOptions } from "@headlessui/vue";
import CheckIcon from '../icons/CheckIcon.vue'
import { SelectOptionData } from "@/types/genericFormTypes";

export default defineComponent({
  name: "SelectMenu",
  components: {
    CheckIcon,
    Listbox,
    ListboxOption,
    ListboxOptions,
    ListboxButton,
  },
  props: {
    options: {
      type: Array as PropType<Array<SelectOptionData>>,
      required: true,
    },
    defaultOption: {
      type: Object as PropType<SelectOptionData>,
      required: false
    }
  },
  setup(props) {
    const defaultOption = props.defaultOption ? ref(props.defaultOption) : ref(props.options[0]);
    return {
      selected: defaultOption,
    };
  },
  methods: {
    handleSelect(event: any){
      this.$emit('selected', event)
    }
  }
});
</script>

<template>
  <Listbox as="div" v-model="selected" @update:modelValue="handleSelect">
    <div class="mt-1 relative">
      <ListboxButton
        class="
          bg-white
          relative
          w-full
          border border-gray-300
          rounded-md
          shadow-sm
          pl-3
          pr-10
          py-2
          text-left
          cursor-default
          focus:outline-none
          focus:ring-1
          focus:ring-blue-500
          focus:border-blue-500
          sm:text-sm
        "
        :label="selected.label"
      >
        <span
          class="
            absolute
            inset-y-0
            right-0
            flex
            items-center
            pr-2
            pointer-events-none
          "
        >
        </span>
      </ListboxButton>

      <ListboxOptions
        class="
          absolute
          z-10
          mt-1
          w-full
          bg-white
          shadow-lg
          max-h-60
          rounded-md
          py-1
          text-base
          ring-1 ring-black ring-opacity-5
          overflow-auto
          focus:outline-none
          sm:text-sm
        "
      >
        <ListboxOption
          as="template"
          v-for="(option, i) in options"
          :key="i"
          :value="option"
          v-slot="{ active, selected }"
        >
          <li
            :class="[
              active ? 'text-white bg-blue-600' : 'text-gray-900',
              'cursor-default select-none relative py-2 pl-3 pr-9',
            ]"
          >
            <span
              :class="[
                selected ? 'font-semibold' : 'font-normal',
                'block truncate',
              ]"
            >
              {{ option.label }}
            </span>

            <span
              v-if="selected"
              :class="[
                active ? 'text-white' : 'text-blue-600',
                'absolute inset-y-0 right-0 flex items-center pr-4',
              ]"
            >
              <CheckIcon class="h-5 w-5" aria-hidden="true" />
            </span>
          </li>
        </ListboxOption>
      </ListboxOptions>
    </div>
  </Listbox>
</template>