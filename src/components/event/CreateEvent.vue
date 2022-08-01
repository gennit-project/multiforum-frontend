<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import {
  useQuery,
  useMutation,
  provideApolloClient,
} from "@vue/apollo-composable";
import { gql } from "@apollo/client/core";
import { useRoute, useRouter } from "vue-router";
import { ChannelData } from "@/types/channelTypes";
import { TagData } from "@/types/tagTypes";
import CreateEditFormFields from "./CreateEditFormFields.vue";
import { checkUrl } from "@/utils/formValidation";

// import ErrorBanner from "../forms/ErrorBanner.vue";
import { apolloClient } from "@/main";
import {
  getReadableTimeFromISO,
  durationHoursAndMinutes,
} from "@/dateTimeUtils";

// import { CREATE_COMMENT_SECTION } from "@/graphQLData/comment/queries";

import { EventData } from "@/types/eventTypes";
import { DateTime } from "luxon";

export default defineComponent({
  name: "CreateEvent",
  components: {
    CreateEditFormFields,
  },
  apollo: {},
  setup() {
    provideApolloClient(apolloClient);
    const now = DateTime.now();

    const route = useRoute();
    const router = useRouter();

    const channelId = route.params.channelId as string;

    const username = "cluse";

    const title = ref("");
    const description = ref("");

    const defaultStartTimeObj = now.startOf("hour").plus({ hours: 1 });
    const minStartTimeObj = defaultStartTimeObj.minus({ days: 1 });

    const defaultStartTimeISO = defaultStartTimeObj.toISO();
    const minStartTimeISO = minStartTimeObj.toISO();
    const startTime = ref(defaultStartTimeISO);

    const getStartTimePieces = (defaultStartTimeObj: DateTime) => {
      const { year, month, day, weekday, hour } = defaultStartTimeObj;

      return {
        startTimeYear: year.toString(),
        startTimeMonth: month.toString(),
        startTimeDayOfMonth: day.toString(),
        startTimeDayOfWeek: weekday.toString(),
        startTimeHourOfDay: hour,
      };
    };

    const startTimePieces = ref(getStartTimePieces(defaultStartTimeObj));
    const defaultEndTimeISO = defaultStartTimeObj.plus({ minutes: 30 }).toISO();
    const endTime = ref(defaultEndTimeISO);
    const locationName = ref("");
    const address = ref("");
    const placeId = ref("");
    const virtualEventUrl = ref("");
    const isInPrivateResidence = ref("false");
    const cost = ref("0");
    const latitude = ref("");
    const longitude = ref("");
    const selectedChannels = ref(channelId ? [channelId] : []);
    const selectedTags = ref([]);

    const GET_CHANNEL_NAMES = gql`
      query getChannelNames {
        channels {
          uniqueName
        }
      }
    `;

    const {
      loading: channelLoading,
      error: channelError,
      result: channelResult,
    } = useQuery(GET_CHANNEL_NAMES);

    const GET_TAGS = gql`
      query {
        tags {
          text
        }
      }
    `;

    const {
      loading: tagsLoading,
      error: tagsError,
      result: tagResult,
    } = useQuery(GET_TAGS);

    const createEventInput = computed(() => {
      const tagConnections = selectedTags.value.map((tag: string) => {
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

      const channelConnections = selectedChannels.value.map(
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
        title: title.value || null,
        description: description.value || null,
        startTime: startTime.value || null,
        startTimeYear: startTimePieces.value.startTimeYear || null,
        startTimeMonth: startTimePieces.value.startTimeMonth || null,
        startTimeDayOfMonth: startTimePieces.value.startTimeDayOfMonth || null,
        startTimeDayOfWeek: startTimePieces.value.startTimeDayOfWeek || null,
        startTimeHourOfDay: startTimePieces.value.startTimeHourOfDay || null,
        endTime: endTime.value || null,
        canceled: false,
        cost: cost.value || null,
        virtualEventUrl: virtualEventUrl.value || null,
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

      if (latitude.value && longitude.value) {
        const locationValues = {
          locationName: locationName.value,
          location: {
            latitude: latitude.value,
            longitude: longitude.value,
          },
          address: address.value,
          placeId: placeId.value,
          isInPrivateResidence: isInPrivateResidence.value,
        };
        input = { ...input, ...locationValues };
      }

      return [input];
    }); // End of createEventInput

    const CREATE_EVENT = gql`
      mutation ($createEventInput: [EventCreateInput!]!) {
        createEvents(input: $createEventInput) {
          events {
            id
            title
            description
            Channels {
              uniqueName
            }
            Poster {
              username
            }
            locationName
            address
            startTime
            startTimeYear
            startTimeMonth
            startTimeDayOfMonth
            startTimeDayOfWeek
            startTimeHourOfDay
            endTime
            virtualEventUrl
            createdAt
            isInPrivateResidence
            cost
            placeId
            location {
              latitude
              longitude
            }
            canceled
            Tags {
              text
            }
          }
        }
      }
    `;

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
            channelId: selectedChannels.value[0],
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

    // let touched = ref({
    //   title: false,
    //   startDate: false,
    //   startTime: false,
    //   endTime: false,
    //   virtualEventUrl: false,
    //   address: false,
    // });

    const channelOptionLabels = computed(() => {
      if (!channelResult.value) {
        return []
      }
      return channelResult.value.channels.map((channel: ChannelData) => channel.uniqueName);
    })

    const tagOptionLabels = computed(() => {
      if (!tagResult.value){
        return []
      }
      return tagResult.value.tags.map((tag: TagData) => tag.text);
    })

    return {
      channelId,
      address,
      channelError,
      channelLoading,
      channelOptionLabels,
      createEvent,
      createEventError,
      createEventInput,
      cost,
      description,
      durationHoursAndMinutes,
      endTime,
      getReadableTimeFromISO,
      isInPrivateResidence,
      latitude,
      locationName,
      longitude,
      minStartTimeISO,
      now,
      placeId,
      router,
      selectedChannels,
      selectedTags,
      startTime,
      startTimePieces,
      tagResult,
      tagsLoading,
      tagOptionLabels,
      tagsError,
      title,
      username,
      virtualEventUrl,
    };
  },
  data() {
    return {
      showCostField: false,
    };
  },
  computed: {
    changesRequired() {
      // We do these checks:
      // - At least one channel is selected
      // - Title is included
      // - Start date and time are in the future
      // - Either a valid event URL or an address is included
      console.log("Debug changes required", {
        title: this.title,
        startTime: this.startTime,
        address: this.address,
        virtualEventUrl: this.virtualEventUrl,
        selectedChannels: this.selectedChannels,
      });
      let now = DateTime.now().toISO();
      const needsChanges = !(
        this.selectedChannels.length > 0 &&
        this.title.length > 0 &&
        this.startTime > now &&
        ((this.address.length > 0 &&
          this.placeId &&
          this.latitude &&
          this.longitude) ||
          this.urlIsValid)
      );
      return needsChanges;
    },
    urlIsValid() {
      return checkUrl(this.virtualEventUrl);
    },
    
  },
  methods: {
    async submit() {
      this.createEvent();
    },
    updateTitle(updated: String) {
      this.title = updated;
    },
    updateDescription(updated: string) {
      this.description = updated;
    },
    updateVirtualEventUrl(updated: string) {
      this.virtualEventUrl = updated;
    },
    updateCost(updated: string) {
      this.cost = updated;
    },
    toggleCostField() {
      this.showCostField = !this.showCostField;
    },
    updateStartTime(time: Date) {
      // Sat Jan 01 2022 18:30:00 GMT-0700 (Mountain Standard Time)
      this.startTime = time.toISOString();
    },
    updateLocationInput(placeData: any) {
      try {
        this.placeId = placeData.place_id;
        this.latitude = placeData.geometry.location.lat();
        this.longitude = placeData.geometry.location.lat();
        this.address = placeData.formatted_address;
        this.locationName = placeData.name;
      } catch (e: any) {
        throw new Error(e);
      }
    },
    setSelectedTags(tag: Array<string>) {
      this.selectedTags = tag;
    },
    setSelectedChannels(channel: Array<string>) {
      console.log('set selected channels' ,channel)
      this.selectedChannels = channel;
    },
    cancel() {
      if (this.channelId) {
        this.router.push({
          name: "SearchEventsInChannel",
          params: {
            channelId: this.channelId,
          },
        });
      } else {
        this.router.push({
          name: "SearchEvents",
        });
      }
    },
  },
});
</script>
<template>
  <CreateEditFormFields
    :channel-error="channelError"
    :channel-loading="channelLoading"
    :channel-option-labels="channelOptionLabels"
    :cost="cost"
    :create-event-error="createEventError"
    :description="description"
    :edit-mode="false"
    :show-cost-field="showCostField"
    :selected-channels="selectedChannels"
    :selected-tags="selectedTags"
    :tag-result="tagResult"
    :tag-option-labels="tagOptionLabels"
    :tags-error="tagsError"
    :tags-loading="tagsLoading"
    :title="title"
    :url-is-valid="urlIsValid"
    :virtual-event-url="virtualEventUrl"
    @cancel="cancel"
    @setSelectedChannels="setSelectedChannels"
    @setSelectedTags="setSelectedTags"
    @submit="submit"
    @toggleCostField="toggleCostField"
    @updateCost="updateCost"
    @updateDescription="updateDescription"
    @updateLocationInput="updateLocationInput"
    @updateStartTime="updateStartTime"
    @updateTitle="updateTitle"
    @updateVirtualEventUrl="updateVirtualEventUrl"
  />
</template>