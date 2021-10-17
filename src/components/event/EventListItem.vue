<script lang="ts">
import { defineComponent, PropType } from "vue";
import { EventData } from "../../types/eventTypes";
import {
  CalendarIcon,
  LocationMarkerIcon,
  UsersIcon,
} from "@heroicons/vue/solid";

export default defineComponent({
  setup() {},
  props: {
    event: {
      type: Object as PropType<EventData>,
      required: true,
    },
  },
  data() {
    return {
      previewIsOpen: false,
    };
  },
  components: {
    CalendarIcon,
    LocationMarkerIcon,
    UsersIcon,
  },
});
</script>

<template>
  <li>
    <div class="block">
      <div class="px-4 py-4 sm:px-6">
        <div class="flex items-center justify-between">
          <p
            @click="$emit('openEventPreview', event)"
            class="text-sm font-medium text-indigo-600 truncate cursor-pointer"
          >
            {{ event.title }}
          </p>
        </div>
        <div class="mt-2 sm:flex sm:justify-between">
          <div class="sm:flex">
            <p class="flex items-center text-sm text-gray-500">
              <UsersIcon
                class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              {{ event.description }}
            </p>
            <p
              class="
                mt-2
                flex
                items-center
                text-sm text-gray-500
                sm:mt-0
                sm:ml-6
              "
            >
              <LocationMarkerIcon
                class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              {{ event.location }}
            </p>
            <p
              class="
                mt-2
                flex
                items-center
                text-sm text-gray-500
                sm:mt-0
                sm:ml-6
              "
            >
              <CalendarIcon
                class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              <time :datetime="event.date">{{ event.dateFull }}</time>
            </p>
          </div>

          <div class="mt-3 text-sm">
            <router-link
              :to="`/c/${event.channelId}/events/${event.id}`"
              class="font-medium text-indigo-600 hover:text-indigo-500"
            >
              View Comments
              <span aria-hidden="true">&rarr;</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </li>
</template>
