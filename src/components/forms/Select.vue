<script lang="js">
import { defineComponent, ref } from "vue";
import ListboxButton from "@/components/forms/ListboxButton.vue";
import {
  Listbox,
  ListboxLabel,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/vue";
import { CheckIcon } from "@heroicons/vue/solid";

export default defineComponent({
  components: {
    CheckIcon,
    Listbox,
    ListboxLabel,
    ListboxOption,
    ListboxOptions,
    ListboxButton,
  },
  props: {
    selectLabel: {
        type: String,
        required: false
    },
    selectedOption: {
        type: Object,
        required: true
    },
    options: {
        type: Array,
        required: true
    }
  },
  setup(props) {
      const selected = ref(props.selectedOption)
      return {
          selected
      }
  }
});
</script>

<template>
  <Listbox as="div" v-model="selected" @update:model-value="$emit('updateSelected', selected)">
    <ListboxLabel
      v-if="selectLabel"
      class="block text-xs font-medium text-gray-700 mt-2"
    >
      {{ selectLabel }}
    </ListboxLabel>
    <div class="relative">
      <ListboxButton :label="`${selected.label}`" />
      <transition
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
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
            v-for="option in options"
            :key="option.label"
            :value="option"
            v-slot="{ active, selected }"
          >
            <li
              :class="[
                active ? 'text-white bg-indigo-600' : 'text-gray-900',
                'cursor-default select-none relative py-2 pl-3 pr-9',
              ]"
            >
              <span
                :class="[
                  selected ? 'font-semibold' : 'font-normal',
                  'block truncate',
                ]"
              >
                {{ `${option.label}` }}
              </span>

              <span
                v-if="selected"
                :class="[
                  active ? 'text-white' : 'text-indigo-600',
                  'absolute inset-y-0 right-0 flex items-center pr-4',
                ]"
              >
                <CheckIcon class="h-5 w-5" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>