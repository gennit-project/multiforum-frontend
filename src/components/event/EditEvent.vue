<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { GET_EVENT } from "@/graphQLData/event/queries";
import {
  useQuery,
  useMutation,
  provideApolloClient,
} from "@vue/apollo-composable";
import { gql } from "@apollo/client/core";
import { useRoute, useRouter } from "vue-router";
import { ChannelData } from "@/types/channelTypes";
import { TagData } from "@/types/tagTypes";
import { apolloClient } from "@/main";
import {
  getReadableTimeFromISO,
  durationHoursAndMinutes,
} from "@/dateTimeUtils";

import { EventData } from "@/types/eventTypes";
import { DateTime } from "luxon";
import { checkUrl } from "@/utils/formValidation";
import CreateEditFormFields from "./CreateEditFormFields.vue";

export default defineComponent({
  name: "EditEvent",
  components: {
    CreateEditFormFields,
  },
  apollo: {},
  setup() {
    provideApolloClient(apolloClient);
    const now = DateTime.now();

    const route = useRoute();
    const router = useRouter();

    const channelId: string | string[] = route.params.channelId;
    const eventId: string | string[] = route.params.eventId;

    const username = "cluse";

    const { result, loading: eventLoading } = useQuery(GET_EVENT, {
      id: eventId,
    });

    const eventData = computed(() => {
      if (!result.value || !result.value.events || !result.value.events[0]) {
        return null;
      }
      return result.value.events[0];
    });

    const existingTags = computed(() => {
      if (!eventData.value || !eventData.value.Tags) {
        return [];
      }
      return eventData.value.Tags.map((tag: TagData) => {
        return tag.text;
      });
    });

    const existingChannels = computed(() => {
      if (!eventData.value || !eventData.value.Channels) {
        return [];
      }
      return eventData.value.Channels.map((channel: ChannelData) => {
        return channel.uniqueName;
      });
    });

    const existingStartTime = computed(() => {
      if (!eventData.value || !eventData.value.startTime) {
        return "";
      }
      return eventData.value.startTime;
    });

    // const existingEndTime = computed(() => {
    //   if (!eventData.value || !eventData.value.endTime) {
    //     return "";
    //   }
    //   return eventData.value.endTime;
    // });

    // The form fields in the edit form are initialized
    // with the existing values.
    const title = ref(eventData.value?.title || "");
    const description = ref(eventData.value?.description || "");
    const selectedChannels = ref(existingChannels.value);
    const selectedTags = ref(existingTags.value);
    const startTime = ref(existingStartTime.value);
    const endTime = ref(existingStartTime.value);

    const startTimePieces = computed(() => {
      const startTimeObj = DateTime.fromISO(startTime.value);
      const { year, month, day, weekday, hour } = startTimeObj;

      return {
        startTimeYear: year.toString(),
        startTimeMonth: month.toString(),
        startTimeDayOfMonth: day.toString(),
        startTimeDayOfWeek: weekday.toString(),
        startTimeHourOfDay: hour,
      };
    });

    const locationName = ref(eventData.value?.locationName || "");
    const address = ref(eventData.value?.address || "");
    const placeId = ref(eventData.value?.placeId || "");
    const virtualEventUrl = ref(eventData.value?.virtualEventUrl || "");
    const isInPrivateResidence = ref(
      eventData.value?.isInPrivateResidence || false
    );
    const cost = ref(eventData.value?.cost || "0");
    const latitude = ref(eventData.value?.latitude);
    const longitude = ref(eventData.value?.longitude);

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
      result: tagsResult,
    } = useQuery(GET_TAGS);

    const channelOptionLabels = computed(() => {
      if (!channelResult.value || !channelResult.value.channels) {
        return [];
      }
      return channelResult.value.channels.map(
        (channel: ChannelData) => channel.uniqueName
      );
    });

    const tagOptionLabels = computed(() => {
      if (!channelResult.value || !channelResult.value.tags) {
        return [];
      }
      return tagsResult.value.tags.map((tag: TagData) => tag.text);
    });

    const updateEventInput = computed(() => {
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

      const tagDisconnections = existingTags.value
        .filter((tag: string) => {
          return !selectedTags.value.includes(tag);
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

      const channelConnections = selectedChannels.value.map(
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
          return !selectedChannels.value.includes(channel);
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
          connectOrCreate: channelConnections,
          disconnect: channelDisconnections,
        },
        Tags: {
          connectOrCreate: tagConnections,
          disconnect: tagDisconnections,
        },
      };

      const inputKeys = Object.keys(input);

      // Don't send empty values in call to update event
      for (let i = 0; i < inputKeys.length; i++) {
        const key = inputKeys[i];
        // eslint-disable-next-line
        let data = input[key];

        if (data === null) {
          // eslint-disable-next-line
          delete input[key];
        }
      }

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

      return input;
    }); // End of updateEventInput

    const UPDATE_EVENT = gql`
      mutation ($updateEventInput: EventUpdateInput, $eventWhere: EventWhere) {
        updateEvents(update: $updateEventInput, where: $eventWhere) {
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
      mutate: updateEvent,
      error: updateEventError,
      onDone,
    } = useMutation(UPDATE_EVENT, () => {
      return {
        errorPolicy: "all",
        variables: {
          updateEventInput: updateEventInput.value,
          eventWhere: {
            id: eventData.value.id,
          },
        },
        update: (cache: any, result: any) => {
          const newEvent: EventData = result.data?.updateEvents?.events[0];

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
      const newEventId = response.data.updateEvents.events[0].id;

      /*
        Redirect to the event detail page in the first
        channel that the event was submitted to.
      */
      router.push({
        name: "EventDetail",
        params: {
          channelId: selectedChannels.value[0],
          eventId: newEventId,
        },
      });
    });

    watch(result, (value: any) => {
      // Used so that some form validation can occur as
      // soon as the page is loaded
      const eventData = value.events[0];
      if (eventData) {
        title.value = eventData.title;

        if (eventData.description) {
          description.value = eventData.description;
        }

        if (eventData.virtualEventUrl) {
          virtualEventUrl.value = eventData.virtualEventUrl;
        }

        if (eventData.address) {
          address.value = eventData.address;
        }

        startTime.value = eventData.startTime;
        selectedChannels.value = eventData.Channels.map(
          (channel: ChannelData) => {
            return channel.uniqueName;
          }
        );
        selectedTags.value = eventData.Tags.map((tag: TagData) => {
          return tag.text;
        });
      }
      console.log("watcher updated ", eventData);
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

    return {
      channelId,
      address,
      channelError,
      channelLoading,
      channelOptionLabels,
      eventData,
      eventLoading,
      description,
      cost,
      durationHoursAndMinutes,
      endTime,
      getReadableTimeFromISO,
      isInPrivateResidence,
      latitude,
      locationName,
      longitude,
      now,
      placeId,
      router,
      selectedChannels,
      selectedTags,
      startTime,
      startTimePieces,
      tagsLoading,
      tagsError,
      tagOptionLabels,
      title,
      touched: false,
      updateEvent,
      updateEventError,
      updateEventInput,
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
    urlIsValid() {
      return checkUrl(this.virtualEventUrl);
    },
  },
  methods: {
    async submit() {
      this.updateEvent();
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
      console.log("updated location input ", placeData);
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
      console.log("set channels", channel);
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
    :address="address"
    :channel-error="channelError"
    :channel-loading="channelLoading"
    :channel-option-labels="channelOptionLabels"
    :cost="cost"
    :create-event-error="null"
    :description="description"
    :edit-mode="true"
    :show-cost-field="showCostField"
    :selected-channels="selectedChannels"
    :selected-tags="selectedTags"
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