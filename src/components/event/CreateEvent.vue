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
import CancelButton from "@/components/buttons/CancelButton.vue";
import SaveButton from "@/components/buttons/SaveButton.vue";
import TextEditor from "@/components/forms/TextEditor.vue";
import FormTitle from "@/components/forms/FormTitle.vue";
import FormRow from "@/components/forms/FormRow.vue";
import Form from "@/components/forms/Form.vue";
import TextInput from "@/components/forms/TextInput.vue";
import TagPicker from "@/components/forms/TagPicker.vue";

import ErrorBanner from "../forms/ErrorBanner.vue";
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
  name: "CreateEvent",
  components: {
    CancelButton,
    CheckBox,
    ErrorBanner,
    Form,
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

    const channelId = route.params.channelId as string;

    const username = "cluse";

    const title = ref("");
    const description = ref("");

    const defaultStartTimeObj = now.startOf("hour").plus({ hours: 1 });
    const minStartTimeObj = defaultStartTimeObj.minus({ days: 1 });

    const defaultStartTimeISO = defaultStartTimeObj.toISO();
    const minStartTimeISO = minStartTimeObj.toISO();
    const startTime = ref(defaultStartTimeISO);

    const getStartTimePieces = (defaultStartTimeObj: typeof DateTime) => {
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
          const newEvent: EventData = result.data?.createEvents?.events[0]

          cache.modify({
            fields: {
              events(existingEventRefs = [], fieldInfo: any) {
                const readField = fieldInfo.readField
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

    return {
      channelId,
      address,
      channelData,
      channelError,
      channelLoading,
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
      tagsData,
      tagsLoading,
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
      // console.log("Debug changes required", {
      //   title: this.title,
      //   startTime: this.startTime,
      //   address: this.address,
      //   virtualEventUrl: this.virtualEventUrl,
      //   selectedChannels: this.selectedChannels,
      // });
      let now = DateTime.now().toISO();
      const needsChanges = !(
        this.selectedChannels.length > 0 &&
        this.title.length > 0 &&
        this.startTime > now &&
        ((this.address.length > 0 &&
          this.placeId &&
          this.latitude &&
          this.longitude) ||
          this.urlIsValid(this.virtualEventUrl))
      );
      return needsChanges;
    },
    changesRequiredMessage() {
      let now = DateTime.now().toISO();
      if (this.selectedChannels.length === 0) {
        return "At least one channel must be selected.";
      }
      if (!this.title) {
        return "A title is required.";
      }
      if (this.startTime <= now) {
        return "The start time must be in the future.";
      }
      if (this.address && !this.placeId) {
        return "Could not find this location on Google Maps.";
      }
      if (!this.address && !this.virtualEventUrl) {
        return "Needs an address or a virtual event URL.";
      }
      if (this.virtualEventUrl && !this.urlIsValid(this.virtualEventUrl)) {
        return "The virtual event URL is invalid.";
      }
      return "";
    },
  },
  methods: {
    urlIsValid(str: string) {
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
      this.createEvent();
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
    <Form>
      <div v-if="channelLoading || tagsLoading"></div>
      <div class="space-y-8 divide-y divide-gray-200 sm:space-y-5">
        <div>
          <FormTitle> Create Event </FormTitle>

          <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
            <FormRow :section-title="'Title'">
              <TextInput
                :value="title"
                :full-width="true"
                @update="updateTitle"
              />
            </FormRow>

            <FormRow :section-title="'Channel(s)'">
              <!-- <ChannelPicker
                v-if="channelData && channelData.channels"
                v-model="selectedChannels"
                :channel-options="getChannelOptionLabels(channelData.channels)"
                :selected-channels="selectedChannels"
                @setSelectedChannels="setSelectedChannels"
              /> -->
            </FormRow>

            <FormRow :section-title="'Start Time'">
              <div class="sm:inline-block md:flex items-center md:space-x-2">
                <!-- <DatePicker
                  v-model="startTime"
                  :is-24="false"
                  :minutesIncrement="30"
                  :minDate="minStartTimeISO"
                /> -->
              </div>
            </FormRow>
            <FormRow :section-title="'End Time'">
              <div class="sm:inline-block md:flex items-center md:space-x-2">
                <!-- <DatePicker
                  v-model="endTime"
                  :is-24="false"
                  :minutesIncrement="30"
                  @update:modelValue="updateStartTime"
                /> -->
              </div>
            </FormRow>

            <FormRow :section-title="'Virtual Event URL'">
              <TextInput
                :value="virtualEventUrl"
                :full-width="true"
                :placeholder="'www.example.com'"
                @update="updateVirtualEventUrl"
              />
            </FormRow>

            <FormRow :section-title="'Address'">
              <LocationSearchBar
                :search-placeholder="'Location'"
                :full-width="true"
                @updateLocationInput="updateLocationInput"
              />
            </FormRow>

            <FormRow :section-title="'More Info'">
              <TextEditor
                class="mb-3"
                :value="description"
                @update="updateDescription"
              />

              <!-- <TagPicker
                class="mt-3 mb-3"
                v-if="tagsData && tagsData"
                v-model="selectedTags"
                :tag-options="getTagOptionLabels(tagsData.tags)"
                :selected-tags="selectedTags"
                @setSelectedTags="setSelectedTags"
              /> -->
              <CheckBox :checked="!showCostField" @input="toggleCostField" />
              <span class="ml-2">This event is free</span>
            </FormRow>

            <FormRow :section-title="'Cost'" v-show="showCostField">
              <TextInput
                :value="cost"
                :full-width="true"
                @update="updateCost"
              />
            </FormRow>
          </div>
        </div>
      </div>
      <ErrorBanner v-if="changesRequired" :text="changesRequiredMessage" />
      <ErrorBanner v-if="createEventError" :text="createEventError.message" />

      <div class="pt-5">
        <div class="flex justify-end">
          <CancelButton @click="cancel" />
          <SaveButton @click.prevent="submit" :disabled="changesRequired" />
        </div>
      </div>
    </Form>

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