<script lang="ts">
import { defineComponent } from "vue";
import {
  Dialog,
  DialogOverlay,
  TransitionChild,
  TransitionRoot,
  DialogTitle
} from "@headlessui/vue";
import XIcon from "@/components/icons/XmarkIcon.vue";

export default defineComponent({
  name: "PreviewContainer",
  components: {
    DialogComponent: Dialog,
    DialogOverlay,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
    XIcon
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    header: {
      type: String,
      default: ""
    },
    topLayer: {
      type: Boolean,
      default: false
    }
  },
  setup() {},
});
</script>

<template>
  <TransitionRoot
    as="template"
    :show="isOpen"
  >
    <DialogComponent
      as="div"
      class="fixed inset-0 overflow-hidden"
      :class="[topLayer ? 'z-30' : 'z-20']"
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
            <div class="w-screen max-w-3xl">
              <div
                class="
                  h-full
                  divide-y divide-gray-200
                  flex flex-col
                   
                  shadow-xl
                "
              >
                <div
                  class="min-h-0 flex-1 flex flex-col py-2  bg-white dark:bg-gray-800 dark:text-gray-200"
                >
                  <div class="px-4 sm:px-6">
                    <div class="flex items-start justify-between">
                      <DialogTitle class="text-lg my-3 font-medium text-gray-900 dark:text-gray-200">
                        {{ header }}
                      </DialogTitle>
                      <div class="ml-3 h-7 flex items-center">
                        <button
                          type="button"
                          class="
                             
                            rounded-full
                            text-gray-400
                            dark:text-gray-200
                            hover:text-gray-500
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-500
                          "
                          @click="$emit('closePreview')"
                        >
                          <span class="sr-only">Close panel</span>
                          <XIcon
                            class="h-6 w-6"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                  <slot />
                </div>
              </div>
            </div>
          </TransitionChild>
        </div>
      </div>
    </DialogComponent>
  </TransitionRoot>
</template>
