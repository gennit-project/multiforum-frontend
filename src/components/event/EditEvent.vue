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
import CancelButton from "@/components/buttons/CancelButton.vue";
import SaveButton from "@/components/buttons/SaveButton.vue";
import TextEditor from "@/components/forms/TextEditor.vue";
import FormTitle from "@/components/forms/FormTitle.vue";
import FormRow from "@/components/forms/FormRow.vue";
import Form from "@/components/forms/Form.vue";
import TextInput from "@/components/forms/TextInput.vue";
import TagPicker from "@/components/forms/TagPicker.vue";
import ErrorBanner from "../forms/ErrorBanner.vue";
import ErrorMessage from "../forms/ErrorMessage.vue";
import { apolloClient } from "@/main";
import {
  getReadableTimeFromISO,
  durationHoursAndMinutes,
} from "@/dateTimeUtils";
import LocationSearchBar from "@/components/forms/LocationSearchBar.vue";
// import { CREATE_COMMENT_SECTION } from "@/graphQLData/comment/queries";
import CheckBox from "@/components/forms/CheckBox.vue";
import { EventData } from "@/types/eventTypes";
import { DateTime } from "luxon";

export default defineComponent({
  name: "EditEvent",
  components: {
    CancelButton,
    CheckBox,
    ErrorBanner,
    ErrorMessage,
    TailwindForm: Form,
    FormRow,
    FormTitle,
    LocationSearchBar,
    SaveButton,
    TagPicker,
    TextEditor,
    TextInput,
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
      result: channelData,
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
      result: tagsData,
    } = useQuery(GET_TAGS);

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

      const channelConnections = selectedChannels.value.map(
        (channel: string | string[]) => {
          return {
            onCreate: {
              node: {
                uniqueName: channel,
              }
            },
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
          connectOrCreate: channelConnections,
        },
        Tags: {
          connectOrCreate: tagConnections,
        },
      };

      
        const inputKeys = Object.keys(input)

        // Don't send empty values in call to update event
        for (let i = 0; i < inputKeys.length; i++) {
          
          const key = inputKeys[i]
          // eslint-disable-next-line
          let data = input[key]

          if (data === null) {
            // eslint-disable-next-line
            delete input[key]
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
            id: eventData.value.id
          }
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
        If the event was updated in the context
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
        If the event was updated in the context
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

    watch(result, (value: any) => {
      // Used so that some form validation can occur as
      // soon as the page is loaded
      const eventData = value.events[0];
      if (eventData) {
        title.value = eventData.title;
        description.value = eventData.body;
        virtualEventUrl.value = eventData.virtualEventUrl;
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
      channelData,
      channelError,
      channelLoading,
      eventData,
      eventLoading,
      existingStartTime,
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
      tagsData,
      tagsLoading,
      tagsError,
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
    changesRequired() {
      // We do these checks:
      // - At least one channel is selected
      // - Title is included
      // - Start date and time are in the future
      // - Either a valid event URL or an address is included
      // console.log("Debug changes required", {
      //   title: this.title,
      //   startTime: this.startTime,
      //   address: this.address,
      //   virtualEventUrl: this.virtualEventUrl,
      //   selectedChannels: this.selectedChannels,
      // });
      // let now = DateTime.now().toISO();
      const needsChanges = !(
        this.selectedChannels.length > 0 &&
        this.title.length > 0 &&
        // this.startTime > now &&
        ((this.address.length > 0 &&
          this.placeId &&
          this.latitude &&
          this.longitude) || this.urlIsValid)  
      );
      return needsChanges;
    },
    changesRequiredMessage() {
      // let now = DateTime.now().toISO();
      if (this.selectedChannels.length === 0) {
        return "At least one channel must be selected.";
      }
      if (!this.title) {
        return "A title is required.";
      }
      // if (this.startTime <= now ) {
      //   return "The start time must be in the future.";
      // }
      if (this.address && !this.placeId) {
        return "Could not find this location on Google Maps.";
      }
      if (!this.address && !this.virtualEventUrl) {
        return "Needs an address or a virtual event URL.";
      }
      if (
        this.virtualEventUrl &&
        !this.urlIsValid
      ) {
        return "The virtual event URL is invalid.";
      }
      return "Changes required";
    },
    urlIsValid() {
      return this.checkUrl(this.virtualEventUrl)
    }
  },
  methods: {
    
    checkUrl(str: string) {
      // Valid URL checker from Devshed
      // Sources:
      // https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
      // http://forums.devshed.com/javascript-development-115/regexp-to-match-url-pattern-493764.html
      var pattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
          "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
          "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
          "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
          "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
          "(\\#[-a-z\\d_]*)?$",
        "i"
      ); // fragment locator
      return !!pattern.test(str);
    },
    async submit() {
      this.updateEvent();
    },
    updateTitle(updated: String) {
      this.title = updated;
    },
    getChannelOptionLabels(options: Array<ChannelData>) {
      return options.map((channel) => channel.uniqueName);
    },
    getTagOptionLabels(options: Array<TagData>) {
      return options.map((tag) => tag.text);
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
  <div>
    <TailwindForm @input="touched=true">
      <div v-if="channelLoading || tagsLoading || !eventData">Loading...</div>
      <div
        v-if="eventData"
        class="space-y-8 divide-y divide-gray-200 sm:space-y-5"
      >
        <div>
          <FormTitle> Edit Event </FormTitle>

          <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
            <FormRow :section-title="'Title'">
              <template v-slot:content>
                <TextInput
                  :initial-value="title"
                  :full-width="true"
                  @update="updateTitle"
                />
              </template>
            </FormRow>

            <FormRow :section-title="'Channel(s)'">
              <template v-slot:content>
                <TagPicker
                  class="mt-3 mb-3"
                  v-if="channelData && channelData.channels"
                  :initial-value="selectedChannels"
                  :tag-options="getChannelOptionLabels(channelData.channels)"
                  :selected-tags="selectedChannels"
                  @setSelectedTags="setSelectedChannels"
                />
              </template>
            </FormRow>

            <FormRow :section-title="'Start Time'">
              <template v-slot:content>
                <div class="sm:inline-block md:flex items-center md:space-x-2">
                  <!-- <DatePicker
                  v-model="startTime"
                  :is-24="false"
                  :minutesIncrement="30"
                /> -->
                </div>
              </template>
            </FormRow>

            <FormRow :section-title="'Virtual Event URL'">
              <template v-slot:content>
                <TextInput
                  :initial-value="virtualEventUrl"
                  :placeholder="'www.example.com'"
                  :full-width="true"
                  @update="updateVirtualEventUrl"
                />
               <ErrorMessage :text="touched && !urlIsValid ? 'URL is invalid.' : ''"/>
              </template>
            </FormRow>

            <FormRow :section-title="'Address'">
              <template v-slot:content>
                <LocationSearchBar
                  :search-placeholder="'Location'"
                  :full-width="true"
                  @updateLocationInput="updateLocationInput"
                />
              </template>
            </FormRow>

            <FormRow :section-title="'More Info'">
              <template v-slot:content>
                <TextEditor
                  class="mb-3"
                  :value="description"
                  @update="updateDescription"
                />

                <TagPicker
                  class="mt-3 mb-3"
                  v-if="tagsData && tagsData"
                  :initial-value="selectedTags"
                  :tag-options="getTagOptionLabels(tagsData.tags)"
                  :selected-tags="selectedTags"
                  @setSelectedTags="setSelectedTags"
                />
                <CheckBox :checked="!showCostField" @input="toggleCostField" />
                <span class="ml-2">This event is free</span>
              </template>
            </FormRow>

            <FormRow :section-title="'Cost'" v-show="showCostField">
              <template v-slot:content>
                <TextInput
                  :initial-value="cost"
                  :full-width="true"
                  @update="updateCost"
                />
              </template>
            </FormRow>
          </div>
        </div>
      </div>
      <ErrorBanner v-if="changesRequired" :text="changesRequiredMessage" />
      <ErrorBanner v-if="updateEventError" :text="updateEventError.message" />

      <div class="pt-5">
        <div class="flex justify-end">
          <CancelButton @click="cancel" />
          <SaveButton @click.prevent="submit" :disabled="changesRequired" />
        </div>
      </div>
    </TailwindForm>

    <div v-for="(error, i) of channelError?.graphQLErrors" :key="i">
      {{ error.message }}
    </div>
    <div v-for="(error, i) of tagsError?.graphQLErrors" :key="i">
      {{ error.message }}
    </div>
  </div>
</template>

<style>
</style>