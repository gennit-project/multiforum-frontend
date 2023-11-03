<script lang="ts">
import { defineComponent, PropType, computed, ref } from "vue";
import { useRoute } from "vue-router";
import { EventData } from "@/types/eventTypes";
import { CANCEL_EVENT } from "@/graphQLData/event/mutations";
import CalendarIcon from "@/components/icons/CalendarIcon.vue";
import LinkIcon from "@/components/icons/LinkIcon.vue";
import LocationIcon from "@/components/icons/LocationIcon.vue";
import ClipboardIcon from "@/components/icons/ClipboardIcon.vue";
import useClipboard from "vue-clipboard3";
import Notification from "@/components/generic/Notification.vue";
import { DateTime } from "luxon";
import { formatDuration, getDurationObj } from "../../../dateTimeUtils";
import { useRouter } from "vue-router";
import MenuButton from "@/components/generic/buttons/MenuButton.vue";
import EllipsisHorizontal from "@/components/icons/EllipsisHorizontal.vue";
import { useMutation, useQuery } from "@vue/apollo-composable";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { DELETE_EVENT } from "@/graphQLData/event/mutations";
import WarningModal from "@/components/generic/WarningModal.vue";
import ErrorBanner from "@/components/generic/ErrorBanner.vue";

export default defineComponent({
  name: "EventHeader",
  components: {
    CalendarIcon,
    ClipboardIcon,
    EllipsisHorizontal,
    LinkIcon,
    LocationIcon,
    MenuButton,
    Notification,
    WarningModal,
    ErrorBanner,
  },
  props: {
    eventData: {
      type: Object as PropType<EventData>,
      required: true,
    },
  },
  setup(props: any) {
    const route = useRoute();
    const { toClipboard } = useClipboard();
    const router = useRouter();

    const showAddressCopiedNotification = ref(false);

    const eventId = computed(() => {
      if (typeof route.params.eventId === "string") {
        return route.params.eventId;
      }
      return "";
    });

    const {
      mutate: deleteEvent,
      error: deleteEventError,
      onDone: onDoneDeleting,
    } = useMutation(DELETE_EVENT, {
      variables: {
        id: eventId.value,
      },
      update: (cache: any) => {
        cache.modify({
          fields: {
            events(existingEventRefs = [], fieldInfo: any) {
              const readField = fieldInfo.readField;

              return existingEventRefs.filter((ref) => {
                return readField("id", ref) !== eventId.value;
              });
            },
          },
        });
      },
    });

    onDoneDeleting(() => {
      if (channelId.value) {
        router.push({
          name: "SearchEventsInChannel",
          params: {
            channelId: channelId.value,
          },
        });
      }
    });

    const copyAddress = async () => {
      try {
        await toClipboard(
          props.eventData.address ? props.eventData.address : "",
        );
        showAddressCopiedNotification.value = true;
      } catch (e: any) {
        throw new Error(e);
      }
      setTimeout(() => {
        showAddressCopiedNotification.value = false;
      }, 2000);
    };

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    const showCopiedLinkNotification = ref(false);

    const permalinkObject = computed(() => {
      if (!props.discussion) {
        return {};
      }
      return {
        name: "DiscussionDetail",
        params: {
          discussionId: props.discussion.id,
          channelId: channelId.value,
        },
      };
    });

    const copyLink = async (event: any) => {
      try {
        const basePath = window.location.origin;
        const permalink = `${basePath}${
          router.resolve(permalinkObject.value).href
        }`;
        await toClipboard(permalink);
        showCopiedLinkNotification.value = event;
      } catch (e: any) {
        throw new Error(e);
      }
      setTimeout(() => {
        showCopiedLinkNotification.value = false;
      }, 2000);
    };

    const {
      result: localUsernameResult,
      loading: localUsernameLoading,
      error: localUsernameError,
    } = useQuery(GET_LOCAL_USERNAME);

    const username = computed(() => {
      if (localUsernameLoading.value || localUsernameError.value) {
        return "";
      }
      return localUsernameResult.value.username;
    });

    console.log("props.event", props.event);
    console.log("username.value", username.value);

    const menuItems = computed(() => {
      const out = []
      if (props.eventData) {
        out.push({
          label: "Copy Link",
          value: "",
          event: "copyLink",
        });
      }

      if (props.eventData?.Poster?.username === username.value) {
        out.push({
          label: "Edit",
          value: "",
          event: "handleEdit",
        });
        out.push({
          label: "Delete",
          value: "",
          event: "handleDelete",
        });

        if (!props.eventData.canceled) {
          out.push({
            label: "Cancel",
            value: "",
            event: "handleCancel",
          })
        }
      }
      
      return out;
    });

    const { mutate: cancelEvent, error: cancelEventError } = useMutation(
      CANCEL_EVENT,
      {
        variables: {
          id: eventId.value,
          updateEventInput: {
            canceled: true,
          },
          eventWhere: {
            id: eventId.value,
          },
        },
      },
    );

    return {
      cancelEvent,
      cancelEventError,
      confirmCancelIsOpen: ref(false),
      confirmDeleteIsOpen: ref(false),
      copyAddress,
      copyLink,
      eventId,
      channelId,
      menuItems,
      route,
      router,
      showAddressCopiedNotification,
      showCopiedLinkNotification,
      deleteEvent,
      deleteEventError,
    };
  },
  methods: {
    getFormattedDateString(startTime: string) {
      const startTimeObj = DateTime.fromISO(startTime);

      return startTimeObj.toFormat("cccc LLLL d yyyy");
    },
    getFormattedTimeString(startTime: string, endTime: string) {
      const eventDurationObj = getDurationObj(startTime, endTime);
      const formattedDuration = formatDuration(eventDurationObj);

      const startTimeObj = DateTime.fromISO(startTime);

      const formattedStartTimeString = startTimeObj.toLocaleString(
        DateTime.TIME_SIMPLE,
      );
      return `${formattedStartTimeString} for ${formattedDuration}`;
    },
  },
});
</script>

<template>
  <div
    class="flex justify-between px-4 text-sm text-gray-700 dark:text-gray-200"
  >
    <ul class="space-y-2">
      <li class="hanging-indent flex items-start">
        <div class="mr-3 h-5 w-5">
          <CalendarIcon />
        </div>
        <span>{{
          `${getFormattedDateString(
            eventData.startTime,
          )}, ${getFormattedTimeString(eventData.startTime, eventData.endTime)}`
        }}</span>
      </li>
      <li
        v-if="eventData.virtualEventUrl"
        class="hanging-indent flex items-start"
      >
        <div class="mr-3 h-5 w-5">
          <LinkIcon />
        </div>
        <a
          class="cursor-pointer underline"
          target="_blank"
          rel="noreferrer"
          :href="eventData.virtualEventUrl"
        >
          {{ eventData.virtualEventUrl }}
        </a>
      </li>
      <li
        v-if="eventData.address"
        class="hanging-indent flex items-start"
      >
        <div class="mr-3 h-5 w-5">
          <LocationIcon />
        </div>
        <div class="flex">
          <span>
            {{ `${eventData.locationName}, ` }}
            <a
              class="underline"
              target="_blank"
              rel="noreferrer"
              :href="`https://www.google.com/maps/place/?q=place_id:${eventData.placeId}`"
            >
              {{ eventData.address }}
            </a>
          </span>
          <span>
            <ClipboardIcon
              class="ml-1 h-4 w-4 cursor-pointer"
              @click="copyAddress"
            />
            <v-tooltip
              activator="parent"
              location="top"
            > Copy </v-tooltip>
          </span>
        </div>
      </li>
      <li
        v-if="!eventData.free && eventData.cost && eventData.cost !== '0'"
        class="hanging-indent flex items-start"
      >
        <div class="mr-3 h-5 w-5">
          <i class="fa-solid fa-ticket h-5" />
        </div>
        <span>{{ eventData.cost }}</span>
      </li>
    </ul>
    <MenuButton
      v-if="eventData && menuItems.length > 0"
      :items="menuItems"
      @copyLink="copyLink"
      @handleEdit="
        router.push(
          `/channels/c/${channelId}/events/e/${eventId}/edit`,
        )
      "
      @handleDelete="confirmDeleteIsOpen = true"
      @handleCancel="confirmCancelIsOpen = true"
    >
      <EllipsisHorizontal
        class="h-6 w-6 cursor-pointer hover:text-black dark:text-gray-300 dark:hover:text-white"
      />
    </MenuButton>
    <Notification
      :show="showAddressCopiedNotification"
      :title="'Copied to clipboard!'"
      @closeNotification="showAddressCopiedNotification = false"
    />
    <Notification
      :show="showCopiedLinkNotification"
      :title="'Copied to clipboard!'"
      @closeNotification="showCopiedLinkNotification = false"
    />
    <WarningModal
      :title="'Delete Event'"
      :body="'Are you sure you want to delete this event?'"
      :open="confirmDeleteIsOpen"
      @close="confirmDeleteIsOpen = false"
      @primaryButtonClick="deleteEvent"
    />
    <ErrorBanner
      v-if="deleteEventError"
      class="mb-2 mt-2"
      :text="deleteEventError.message"
    />
    <ErrorBanner
      v-if="cancelEventError"
      class="mb-2 mt-2"
      :text="cancelEventError.message"
    />
    <WarningModal
      v-if="confirmCancelIsOpen"
      :title="'Cancel Event'"
      :body="'Are you sure you want to cancel this event? This action cannot be undone.'"
      :open="confirmCancelIsOpen"
      :primary-button-text="'Yes, cancel the event'"
      :secondary-button-text="'No'"
      @close="confirmCancelIsOpen = false"
      @primaryButtonClick="cancelEvent"
    />
  </div>
</template>
