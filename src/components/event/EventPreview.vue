<script lang="ts">
import { defineComponent, PropType } from "vue";
import { EventData } from "../../types/eventTypes";

export default defineComponent({
  props: {
    event: {
      type: Object as PropType<EventData>,
      required: false,
    },
  },
  setup() {},
});
</script>
<template>
<div>
  <div class="mt-6 relative flex-1 px-4 sm:px-6">
    {{ event ? event.title : "No description" }}
    <div v-if="event" class="mt-3 text-sm">
      <router-link
        :to="`/c/${event.channelId}/events/${event.id}`"
        class="font-medium text-indigo-600 hover:text-indigo-500"
      >
        View Comments
        <span aria-hidden="true">&rarr;</span>
      </router-link>
    </div>
  </div>

  <div class="flex-1 flex flex-col justify-end">
    <div v-if="event" class="px-4 divide-y divide-gray-200 sm:px-6">
      <div class="space-y-6 pt-6 pb-5">
        <div>
          <label
            for="description"
            class="block text-sm font-medium text-gray-900"
          >
            Comment
          </label>
          <div class="mt-1">
            <textarea
              id="description"
              name="description"
              rows="4"
              class="
                block
                w-full
                shadow-sm
                sm:text-sm
                focus:ring-indigo-500 focus:border-indigo-500
                border border-gray-300
                rounded-md
              "
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="flex-shrink-0 px-4 py-4 flex justify-end">
    <button
      type="button"
      class="
        bg-white
        py-2
        px-4
        border border-gray-300
        rounded-md
        shadow-sm
        text-sm
        font-medium
        text-gray-700
        hover:bg-gray-50
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        focus:ring-indigo-500
      "
      @click="$emit('closePreview')"
    >
      Close
    </button>
    <button
      v-if="event"
      type="submit"
      class="
        ml-4
        inline-flex
        justify-center
        py-2
        px-4
        border border-transparent
        shadow-sm
        text-sm
        font-medium
        rounded-md
        text-white
        bg-indigo-600
        hover:bg-indigo-700
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        focus:ring-indigo-500
      "
    >
      Save
    </button>
  </div>
</div>
</template>
