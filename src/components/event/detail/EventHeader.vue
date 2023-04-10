<script lang="ts">
import { defineComponent, PropType, computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { EventData } from "@/types/eventTypes";
import GenericButton from "@/components/generic/GenericButton.vue";
import RequireAuth from "@/components/auth/RequireAuth.vue";
import CreateButton from "@/components/generic/CreateButton.vue";
import PrimaryButton from "@/components/generic/PrimaryButton.vue";
import CalendarIcon from "@/components/icons/CalendarIcon.vue";
import HomeIcon from "@/components/icons/HomeIcon.vue";
import LinkIcon from "@/components/icons/LinkIcon.vue";
import LocationIcon from "@/components/icons/LocationIcon.vue";
import ClipboardIcon from "@/components/icons/ClipboardIcon.vue";
import TicketIcon from "@/components/icons/TicketIcon.vue";
import useClipboard from "vue-clipboard3";

export default defineComponent({
  name: "EventHeader",
  components: {
    CalendarIcon,
    ClipboardIcon,
    CreateButton,
    GenericButton,
    HomeIcon,
    LinkIcon,
    LocationIcon,
    RequireAuth,
    PrimaryButton,
    TicketIcon,
  },
  props: {
    eventData: {
      type: Object as PropType<EventData>,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const { toClipboard } = useClipboard();

    const showAddressCopiedNotification = ref(false);

    const copyAddress = async () => {
      try {
        await toClipboard(
          props.eventData.address ? props.eventData.address : ""
        );
        showAddressCopiedNotification.value = true;
      } catch (e: any) {
        throw new Error(e);
      }
      setTimeout(() => {
        showAddressCopiedNotification.value = false;
      }, 2000);
    };

    const eventId = computed(() => {
      if (typeof route.params.eventId === "string") {
        return route.params.eventId;
      }
      return "";
    });

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    return {
        copyAddress,
      eventId,
      channelId,
      showAddressCopiedNotification,
    };
  },
});
</script>

<template>
  <div class="mb-4 md:flex md:items-center md:justify-between px-4 py-4">
    <div class="flex-1 min-w-0">
      <h2
        class="text-xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight sm:truncate"
      >
        {{ eventData.title }}
      </h2>
    </div>
    <div v-if="channelId" class="mt-4 flex-shrink-0 flex md:mt-0 md:ml-4">
      <div class="float-right">
        <span>
          <RequireAuth
            class="flex inline-flex"
            v-if="eventData.Poster"
            :require-ownership="true"
            :owners="[eventData.Poster.username]"
          >
            <template v-slot:has-auth>
              <router-link
                :to="`/channels/c/${channelId}/events/e/${eventId}/edit`"
              >
                <GenericButton :text="'Edit'" />
              </router-link>
            </template>
          </RequireAuth>
          <RequireAuth class="flex inline-flex">
            <template v-slot:has-auth>
              <CreateButton
                class="ml-2"
                v-if="$route.name === 'EventDetail'"
                :to="`/channels/c/${channelId}/events/create`"
                :label="'Create Event'"
              />
            </template>
            <template v-slot:does-not-have-auth>
              <PrimaryButton class="ml-2" :label="'Create Event'" />
            </template>
          </RequireAuth>
        </span>
      </div>
    </div>
  </div>

  <div class="px-4 text-sm text-gray-700 space-y-2">
    <ul>
      <li class="hanging-indent">
        <CalendarIcon class="inline h-5 w-5 mr-3 text-gray-700" />{{
          `${getFormattedDateString(
            eventData.startTime
          )}, ${getFormattedTimeString(eventData.startTime, eventData.endTime)}`
        }}
      </li>
      <li class="hanging-indent" v-if="eventData.isInPrivateResidence">
        <HomeIcon class="inline" /> This event is in a private residence.
      </li>

      <li class="hanging-indent" v-if="eventData.virtualEventUrl">
        <LinkIcon class="inline h-5 w-5 mr-2 text-gray-700" />
        <span class="underline cursor-pointer" @click="openLink">
          {{ eventData.virtualEventUrl }}
        </span>
      </li>
      <li class="hanging-indent" v-if="eventData.address">
        <LocationIcon class="inline h-5 w-5 mr-2 text-gray-700"></LocationIcon>

        {{ `${eventData.locationName}, ` }}
        <span
          ><a
            class="underline"
            target="_blank"
            rel="noreferrer"
            :href="`https://www.google.com/maps/place/?q=place_id:${eventData.placeId}`"
          >
            {{ eventData.address }}
          </a>

          <VTooltip class="inline-flex">
            <ClipboardIcon
              class="ml-1 h-4 w-4 cursor-pointer"
              @click="copyAddress"
            />
            <template #popper> Copy </template>
          </VTooltip>
        </span>
      </li>
      <li
        class="hanging-indent"
        v-if="!eventData.free && eventData.cost && eventData.cost !== '0'"
      >
        <TicketIcon class="inline h-5 w-5 mr-2 text-gray-700" />
        {{ eventData.cost }}
      </li>
    </ul>
  </div>
</template>
