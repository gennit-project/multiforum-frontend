<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import {
  useMutation,
  provideApolloClient,
} from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { CreateEditEventFormValues } from "@/types/eventTypes";
import CreateEditEventFields from "./CreateEditEventFields.vue";
import { CREATE_EVENT } from "@/graphQLData/event/queries"
import { apolloClient } from "@/main";
import { getTimePieces } from "@/utils/dateTimeUtils";
import { DateTime } from "luxon";
import { EventData } from "@/types/eventTypes";
import { TagData } from "@/types/tagTypes";
import { gql } from "@apollo/client/core";
import defaultEventFormValues from "./defaultEventFormValues";
// import { CREATE_COMMENT_SECTION } from "@/graphQLData/comment/queries";

export default defineComponent({
  name: "CreateEvent",
  components: {
    CreateEditEventFields,
  },
  apollo: {},
  setup() {
    provideApolloClient(apolloClient);
    const now = DateTime.now();

    const route = useRoute();
    const router = useRouter();

    const channelId = route.params.channelId as string;

    const createEventDefaultValues: CreateEditEventFormValues = defaultEventFormValues

    const formValues = ref(createEventDefaultValues)
    const defaultStartTimeObj = now.startOf("hour").plus({ hours: 1 });

    const startTimePieces = ref(getTimePieces(defaultStartTimeObj));
    // const defaultEndTimeISO = defaultStartTimeObj.plus({ minutes: 30 }).toISO();

    const createEventInput = computed(() => {
      const tagConnections = formValues.value.selectedTags.map((tag: string) => {
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
      });

      const channelConnections = formValues.value.selectedChannels.map(
        (channel: string | string[]) => {
          return {
            where: {
              node: {
                uniqueName: channel,
              },
            },
          };
        }
      );

      let input = {
        /*
          Using null values by default for required fields such as the
          title prevents the empty string from being created on the back
          end if the title is not provided.
        */
        title: formValues.value.title || null,
        description: formValues.value.description || null,
        startTime: formValues.value.startTime || null,
        startTimeYear: startTimePieces.value.startTimeYear || null,
        startTimeMonth: startTimePieces.value.startTimeMonth || null,
        startTimeDayOfMonth: startTimePieces.value.startTimeDayOfMonth || null,
        startTimeDayOfWeek: startTimePieces.value.startTimeDayOfWeek || null,
        startTimeHourOfDay: startTimePieces.value.startTimeHourOfDay || null,
        endTime: formValues.value.endTime || null,
        canceled: false,
        cost: formValues.value.cost || "0",
        virtualEventUrl: formValues.value.virtualEventUrl || null,
        Channels: {
          connect: channelConnections,
        },
        Tags: {
          connectOrCreate: tagConnections,
        },
        Poster: {
          connect: {
            where: {
              node: {
                username: "cluse",
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
          isInPrivateResidence: formValues.value.isInPrivateResidence,
        };
        input = { ...input, ...locationValues };
      }

      return [input];
    }); // End of createEventInput

    const {
      mutate: createEvent,
      error: createEventError,
      onDone,
    } = useMutation(CREATE_EVENT, () => {
      return {
        errorPolicy: "all",
        variables: {
          createEventInput: createEventInput.value,
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

                // Quick safety check - if the new event is already
                // present in the cache, we don't need to add it again.
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
      // Add a new comment section for each selected channel.
      // createCommentSections({
      //   variables: {
      //     commentSectionObjects: getCommentSectionObjects(newEventId),
      //   },
      // });
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
      channelId,
      createEvent,
      createEventError,
      createEventInput,
      formValues,
      router
    };
  },
  data() {
    return {
      showCostField: false,
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
  <CreateEditEventFields
    :create-event-error="createEventError"
    :edit-mode="false"
    :form-values="formValues"
    @submit="submit"
    @updateFormValues="updateFormValues"
  />
</template>