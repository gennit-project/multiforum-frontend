<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import {
  useMutation,
  useQuery,
  provideApolloClient,
} from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { CreateEditEventFormValues } from "@/types/eventTypes";
import CreateEditEventFields from "./CreateEditEventFields.vue";
import { CREATE_EVENT_WITH_CHANNEL_CONNECTIONS } from "@/graphQLData/event/mutations";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { apolloClient } from "@/main";
import { getTimePieces } from "@/utils/dateTimeUtils";
import { DateTime } from "luxon";
import { EventData } from "@/types/eventTypes";
import { gql } from "@apollo/client/core";
import getDefaultEventFormValues from "./defaultEventFormValues";
import RequireAuth from "../../auth/RequireAuth.vue";

export default defineComponent({
  name: "CreateEvent",
  components: {
    CreateEditEventFields,
    RequireAuth
  },
  apollo: {},
  setup() {
    provideApolloClient(apolloClient);
    const now = DateTime.now();

    const route = useRoute();
    const router = useRouter();

    const { result: localUsernameResult } = useQuery(GET_LOCAL_USERNAME);

    const username = computed(() => {
      let username = localUsernameResult.value?.username;
      if (username) {
        return username;
      }
      return "";
    });

    const channelId: string = `${
      route.params.channelId ? route.params.channelId : ""
    }`;

    const createEventDefaultValues: CreateEditEventFormValues =
      getDefaultEventFormValues(channelId);

    const formValues = ref(createEventDefaultValues);
    const defaultStartTimeObj = now.startOf("hour").plus({ hours: 1 });

    const startTimePieces = ref(getTimePieces(defaultStartTimeObj));

    const createEventInput = computed(() => {
      const tagConnections = formValues.value.selectedTags;

      let input = {
        /*
          Using null values by default for required fields such as the
          title prevents the empty string from being created on the back
          end if the title is not provided.
        */
        title: formValues.value.title || null,
        description: formValues.value.description || null,
        startTime: formValues.value.startTime || null,
        startTimeDayOfWeek: startTimePieces.value.startTimeDayOfWeek || null,
        startTimeHourOfDay: startTimePieces.value.startTimeHourOfDay || 0,
        endTime: formValues.value.endTime || null,
        canceled: false,
        cost: formValues.value.cost || "",
        free: formValues.value.free || false,
        virtualEventUrl: formValues.value.virtualEventUrl || null,
        isInPrivateResidence: formValues.value.isInPrivateResidence || null,
        Tags: {
          connectOrCreate: tagConnections,
        },
        Poster: {
          connect: {
            where: {
              node: {
                username: username.value,
              },
            },
          },
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
    }); // End of createEventInput
    console.log('create input', createEventInput.value)

    const {
      mutate: createEvent,
      error: createEventError,
      onDone,
    } = useMutation(CREATE_EVENT_WITH_CHANNEL_CONNECTIONS, () => {
      return {
        errorPolicy: "all",
        variables: {
          createEventInput,
          channelConnections: formValues.value.selectedChannels
        },
        update: (cache: any, result: any) => {
          const newEvent: EventData = result.data?.createEvents?.events[0];

          cache.modify({
            fields: {
              events(existingEventRefs = [], fieldInfo: any) {
                const readField = fieldInfo.readField;
                const newEventRef = cache.writeFragment({
                  data: newEvent,
                  fragment: gql`
                    fragment NewEvent on Events {
                      id
                    }
                  `,
                });

                if (
                  existingEventRefs.some(
                    (ref: any) => readField("id", ref) === newEventRef.id
                  )
                ) {
                  return existingEventRefs;
                }
                return [newEventRef, ...existingEventRefs];
              },
            },
          });
        },
      };
    });

    onDone((response: any) => {

      const newEventId = response.data.createEvents.events[0].id;

      /*
        If the event was created in the context
        of a channel, redirect to the event detail page in
        the channel.
      */

      if (channelId) {
        router.push({
          name: "EventDetail",
          params: {
            channelId,
            eventId: newEventId,
          },
        });
      } else {
        /*
        If the event was created in the context
        of the server-wide events page,
        redirect to the event detail page in the first
        channel that the event was submitted to.
      */
        router.push({
          name: "EventDetail",
          params: {
            channelId: formValues.value.selectedChannels[0],
            eventId: newEventId,
          },
        });
      }
    });


    return {
      channelId,
      createEvent,
      createEventError,
      createEventInput,
      formValues,
      router,
    };
  },
  methods: {
    async submit() {
      this.createEvent();
    },
    updateFormValues(data: CreateEditEventFormValues) {
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
  <RequireAuth>
    <template #has-auth>
      <CreateEditEventFields
        :create-event-error="createEventError"
        :edit-mode="false"
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