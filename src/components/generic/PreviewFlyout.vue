<script lang="ts">
import { defineComponent, ref } from "vue";
import {
  Dialog,
  DialogOverlay,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import XIcon from "@/components/icons/XmarkIcon.vue";

export default defineComponent({
  components: {
    TailwindDialog: Dialog,
    DialogPanel,
    DialogOverlay,
    TransitionChild,
    TransitionRoot,
    XIcon,
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    const cancelButtonRef = ref();
    return {
      cancelButtonRef,
    };
  },
});
</script>

<template>
  <TransitionRoot as="template" :show="isOpen">
    <TailwindDialog
      as="div"
      class="fixed inset-0 overflow-hidden z-20"
      :initialFocus="cancelButtonRef"
      @close="$emit('closePreview')"
    >
      <div class="absolute inset-0 overflow-hidden">
        <DialogOverlay class="absolute inset-0" />

        <div class="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <TransitionChild
            as="template"
            enter="transform transition ease-in-out duration-100 sm:duration-100"
            enter-from="translate-x-full"
            enter-to="translate-x-0"
            leave="transform transition ease-in-out duration-100 sm:duration-100"
            leave-from="translate-x-0"
            leave-to="translate-x-full"
          >
          <DialogPanel class="pointer-events-auto w-screen max-w-xl">
            <div
              class="h-full divide-y divide-gray-200 flex flex-col shadow-xl bg-white dark:bg-gray-900 dark:text-gray-200"
            >
              <div
                class="min-h-0 flex-1 flex flex-col py-6 overflow-y-scroll"
              >
                <div>
                  <div class="flex items-start justify-between">
                    <div class="h-7 flex items-center">
                      <button
                        :ref="cancelButtonRef"
                        type="button"
                        class="ml-8 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @click="$emit('closePreview')"
                      >
                        <span class="sr-only">Close panel</span>
                        <XIcon class="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
                <div class="relative flex-1 mx-8">
                  <slot></slot>
                </div>
              </div>
              <div class="flex-shrink-0 px-4 py-4 flex justify-end">
                <button
                  type="button"
                  class="py-2 px-4 border border-gray-300 dark:bg-gray-700 dark:border-gray-700 dark:text-gray-400 rounded-full shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  @click="$emit('closePreview')"
                >
                  Close
                </button>
              </div>
            </div>
          </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </TailwindDialog>
  </TransitionRoot>
</template>
