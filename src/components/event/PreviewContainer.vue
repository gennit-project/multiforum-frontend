<script lang="ts">
import { defineComponent } from "vue";
import {
  Dialog,
  DialogOverlay,
  TransitionChild,
  TransitionRoot,
  DialogTitle
} from "@headlessui/vue";
import XIcon from "../icons/XmarkIcon.vue";

export default defineComponent({
  name: "PreviewContainer",
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
  components: {
    Dialog,
    DialogOverlay,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
    XIcon
  },
});
</script>

<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog
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
            <div class="w-screen max-w-md">
              <div
                class="
                  h-full
                  divide-y divide-gray-200
                  flex flex-col
                  bg-white
                  shadow-xl
                "
              >
                <div
                  class="min-h-0 flex-1 flex flex-col py-6 overflow-y-scroll"
                >
                  <div class="px-4 sm:px-6">
                    <div class="flex items-start justify-between">
                      <DialogTitle class="text-lg font-medium text-gray-900">
                        {{ header }}
                      </DialogTitle>
                      <div class="ml-3 h-7 flex items-center">
                        <button
                          type="button"
                          class="
                            bg-white
                            rounded-md
                            text-gray-400
                            hover:text-gray-500
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-500
                          "
                          @click="$emit('closePreview')"
                        >
                          <span class="sr-only">Close panel</span>
                          <XIcon class="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <slot/>
                </div>
                
              </div>
              
            </div>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
