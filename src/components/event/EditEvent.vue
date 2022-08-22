<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { GET_EVENT } from "@/graphQLData/event/queries";
import { UPDATE_EVENT } from "@/graphQLData/event/mutations";
import {
  useQuery,
  useMutation,
  provideApolloClient,
} from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { ChannelData } from "@/types/channelTypes";
import { TagData } from "@/types/tagTypes";
import { apolloClient } from "@/main";
import { EventData, CreateEditEventFormValues } from "@/types/eventTypes";
import { DateTime } from "luxon";
import getDefaultEventFormValues from "./defaultEventFormValues";
import CreateEditEventFields from "./CreateEditEventFields.vue";

export default defineComponent({
  name: "EditEvent",
  components: {
    CreateEditEventFields,
  },
  apollo: {},
  setup() {
    provideApolloClient(apolloClient);
    const route = useRoute();
    const router = useRouter();
    const channelId: string | string[] = route.params.channelId;
    const eventId: string | string[] = route.params.eventId;

    const {
      result: getEventResult,
      loading: getEventLoading,
      error: getEventError,
      onResult: onGetEventResult,
    } = useQuery(GET_EVENT, {
      id: eventId,
    });

    const event = computed(() => {
      if (getEventError.value || getEventLoading.value) {
        return null;
      }
      return getEventResult.value.events[0];
    });

    // Remember the existing tags so that if the user removes
    // one or more tags, we will know to manually disconnect
    // the nodes in the async call when the post is updated.
    const existingTags = computed(() => {
      if (getEventError.value || getEventLoading.value || !event.value.Tags) {
        return [];
      }
      return event.value.Tags.map((tag: TagData) => {
        return tag.text;
      });
    });

    const existingChannels = computed(() => {
      if (
        getEventError.value ||
        getEventLoading.value ||
        !event.value.Channels
      ) {
        return [];
      }
      return event.value.Channels.map((channel: ChannelData) => {
        return channel.uniqueName;
      });
    });

    const getFormValuesFromEventData = (event: EventData) => {
      return {
        poster: "cluse",
        title: event.title,
        description: event.description || "",
        selectedTags: event.Tags.map((tag: TagData) => {
          return tag.text;
        }),
        selectedChannels: event.Channels.map((channel: ChannelData) => {
          return channel.uniqueName;
        }),
        address: event.address,
        location: event.location,
        placeId: event.placeId,
        locationName: event.locationName,
        isInPrivateResidence: event.isInPrivateResidence,
        virtualEventUrl: event.virtualEventUrl || "",
        startTime: event.startTime,
        startTimeYear: event.startTimeYear,
        startTimeMonth: event.startTimeMonth,
        startTimeDayOfMonth: event.startTimeDayOfMonth,
        startTimeDayOfWeek: event.startTimeDayOfWeek,
        startTimeHourOfDay: event.startTimeHourOfDay,
        endTime: event.endTime,
        canceled: event.canceled,
        deleted: event.deleted,
        cost: event.cost,
        free: event.free,
      };
    };

    const getDefaultFormValues = () => {
      // If the event data is already loaded, start with
      // the existing values. This will be used if you load the page,
      // navigate away and come back.
      if (event.value) {
        return getFormValuesFromEventData(event.value);
      }
      // If the event data is loading, start with empty values. These
      // will be overwritten by onGetEventResult function when the post
      // data is loaded.
      return getDefaultEventFormValues(channelId);
    };

    const formValues = ref<CreateEditEventFormValues>(getDefaultFormValues());

    onGetEventResult((value) => {
      const event = value.data.events[0];

      formValues.value = getFormValuesFromEventData(event);
    });

    const updateEventInput = computed(() => {
      const tagConnections = formValues.value.selectedTags.map(
        (tag: string) => {
          return {
            onCreate: {
              node: {
                text: tag,
              },
            },
            where: {
              node: {
                text: tag,
              },
            },
          };
        }
      );

      const tagDisconnections = existingTags.value
        .filter((tag: string) => {
          return !formValues.value.selectedTags.includes(tag);
        })
        .map((tag: string) => {
          return {
            where: {
              node: {
                text: tag,
              },
            },
          };
        });

      const channelConnections = formValues.value.selectedChannels.map(
        (channel: string | string[]) => {
          return {
            onCreate: {
              node: {
                uniqueName: channel,
              },
            },
            where: {
              node: {
                uniqueName: channel,
              },
            },
          };
        }
      );

      const channelDisconnections = existingChannels.value
        .filter((channel: string) => {
          return !formValues.value.selectedChannels.includes(channel);
        })
        .map((channel: string) => {
          return {
            where: {
              node: {
                uniqueName: channel,
              },
            },
          };
        });

      const getStartTimePieces = () => {
        const startTimeObj = DateTime.fromISO(formValues.value.startTime);
        const { year, month, day, weekday, hour } = startTimeObj;

        return {
          startTimeYear: year.toString(),
          startTimeMonth: month.toString(),
          startTimeDayOfMonth: day.toString(),
          startTimeDayOfWeek: weekday.toString(),
          startTimeHourOfDay: hour,
        };
      };

      const startTimePieces = getStartTimePieces();

      let input = {
        /*
          Using null values by default for required fields such as the
          title prevents the empty string from being created on the back
          end if the title is not provided.
        */
        title: formValues.value.title || null,
        description: formValues.value.description || null,
        startTime: formValues.value.startTime || null,
        startTimeYear: startTimePieces.startTimeYear || null,
        startTimeMonth: startTimePieces.startTimeMonth || null,
        startTimeDayOfMonth: startTimePieces.startTimeDayOfMonth || null,
        startTimeDayOfWeek: startTimePieces.startTimeDayOfWeek || null,
        startTimeHourOfDay: startTimePieces.startTimeHourOfDay,
        endTime: formValues.value.endTime || null,
        canceled: formValues.value.canceled,
        cost: formValues.value.cost,
        free: formValues.value.free,
        virtualEventUrl: formValues.value.virtualEventUrl || null,
        isInPrivateResidence: formValues.value.isInPrivateResidence || null,
        Channels: {
          connectOrCreate: channelConnections,
          disconnect: channelDisconnections,
        },
        Tags: {
          connectOrCreate: tagConnections,
          disconnect: tagDisconnections,
        },
      };

      if (formValues.value.latitude && formValues.value.longitude) {
        const locationValues = {
          locationName: formValues.value.locationName,
          location: {
            latitude: formValues.value.latitude,
            longitude: formValues.value.longitude,
          },
          address: formValues.value.address,
          placeId: formValues.value.placeId,
        };
        input = { ...input, ...locationValues };
      }

      return input;
    }); // End of updateEventInput

    const {
      mutate: updateEvent,
      error: updateEventError,
      onDone,
    } = useMutation(UPDATE_EVENT, () => {
      return {
        errorPolicy: "all",
        variables: {
          updateEventInput: updateEventInput.value,
          eventWhere: {
            id: eventId,
          },
        },
      };
    });

    onDone(() => {
      // Add a new comment section for each selected channel.
      // createCommentSections({
      //   variables: {
      //     commentSectionObjects: getCommentSectionObjects(newEventId),
      //   },
      // });

      /*
        Redirect to the event detail page in the first
        channel that the event was submitted to.
      */
      router.push({
        name: "EventDetail",
        params: {
          channelId: formValues.value.selectedChannels[0],
          eventId,
        },
      });
    });

    // const getCommentSectionObjects = (newEventId: string) => {
    //   return selectedChannels.value.map((c) => {
    //     return {
    //       id: newEventId + c,
    //       Event: {
    //         id: newEventId,
    //       },
    //       Channel: {
    //         uniqueName: c,
    //       },
    //     };
    //   });
    // };

    return {
      getEventError,
      getEventLoading,
      getEventResult,
      formValues,
      channelId,
      router,
      updateEvent,
      updateEventError,
      updateEventInput,
    };
  },
  methods: {
    async submit() {
      this.updateEvent();
    },
    updateFormValues(data: CreateEditEventFormValues) {
      // Update all form values at once because it makes cleaner
      // code than passing each form individual value as a prop to
      // CreateEditEventFields or writing separate methods to update each value.
      const existingValues = this.formValues;
      this.formValues = {
        ...existingValues,
        ...data,
      };
    },
  },
});
</script>
<template>
  <CreateEditEventFields
    :edit-mode="true"
    :event-loading="getEventLoading"
    :get-event-error="getEventError"
    :update-post-error="updateEventError"
    :form-values="formValues"
    @submit="submit"
    @updateFormValues="updateFormValues"
  />
</template>