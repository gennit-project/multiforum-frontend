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
import RequireAuth from "../../auth/RequireAuth.vue";
import { EventChannel } from "@/__generated__/graphql";

export default defineComponent({
  name: "EditEvent",
  components: {
    CreateEditEventFields,
    RequireAuth
  },
  apollo: {},
  setup() {
    provideApolloClient(apolloClient);
    const route = useRoute();
    const router = useRouter();
    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

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

    const ownerList = computed(() => {
      if (event.value && event.value.Poster) {
        return [event.value.Poster.username]
      }
      return []
    })

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

    function getFormValuesFromEventData(event: EventData): CreateEditEventFormValues  {
      return {
        title: event.title,
        description: event.description || "",
        selectedTags: event.Tags.map((tag: TagData) => {
          return tag.text;
        }),
        selectedChannels: event.EventChannels.map((ec: EventChannel) => {
          return ec.channelUniqueName;
        }),
        address: event.address,
        placeId: event.placeId,
        locationName: event.locationName,
        isInPrivateResidence: event.isInPrivateResidence,
        virtualEventUrl: event.virtualEventUrl || "",
        startTime: event.startTime,
        startTimeDayOfWeek: event.startTimeDayOfWeek,
        startTimeHourOfDay: event.startTimeHourOfDay,
        endTime: event.endTime,
        canceled: event.canceled,
        deleted: event.deleted,
        cost: event.cost,
        free: event.free,
      };
    }

    function getDefaultFormValues(): CreateEditEventFormValues {
      // If the event data is already loaded, start with
      // the existing values. This will be used if you load the page,
      // navigate away and come back.
      if (event.value) {
        return getFormValuesFromEventData(event.value);
      }
      // If the event data is loading, start with empty values. These
      // will be overwritten by onGetEventResult function when the event
      // data is loaded.
      return getDefaultEventFormValues(channelId.value);
    }

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
        const { weekday, hour } = startTimeObj;

        return {
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



    return {
      getEventError,
      getEventLoading,
      getEventResult,
      formValues,
      channelId,
      ownerList,
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
  <RequireAuth
    :require-ownership="true"
    :owners="ownerList"
  >
    <template #has-auth>
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
    <template #does-not-have-auth>
      <div class="p-8 flex justify-center">
        You don't have permission to see this page.
      </div>
    </template>
  </RequireAuth>
</template>