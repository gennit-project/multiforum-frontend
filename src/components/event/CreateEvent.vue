<script lang="ts">
import { defineComponent, ref } from "vue";
import {
  useQuery,
  useMutation,
  provideApolloClient,
} from "@vue/apollo-composable";
import { gql } from "@apollo/client/core";
import { useRoute } from "vue-router";
import { ChannelData } from "@/types/channelTypes";
import { TagData } from "@/types/tagTypes";
import CancelButton from "@/components/buttons/CancelButton.vue";
import SaveButton from "@/components/buttons/SaveButton.vue";
import TextEditor from "@/components/forms/TextEditor.vue";
import FormTitle from "@/components/forms/FormTitle.vue";
import FormRow from "@/components/forms/FormRow.vue";
import Form from "@/components/forms/Form.vue";
import TextInput from "@/components/forms/TextInput.vue";
import ChannelPicker from "@/components/forms/ChannelPicker.vue";
import TagPicker from "@/components/forms/TagPicker.vue";
import DatePicker from "vue3-date-time-picker";
import "vue3-date-time-picker/dist/main.css";
import { apolloClient } from "@/main";
import {
  getReadableTimeFromISO,
  durationHoursAndMinutes,
} from "@/dateTimeUtils";
import LocationSearchBar from "@/components/forms/LocationSearchBar.vue";
// import { CREATE_COMMENT_SECTION } from "@/graphQLData/comment/queries";
import CheckBox from "@/components/forms/CheckBox.vue";
const { DateTime } = require("luxon");

export default defineComponent({
  name: "CreateEvent",
  components: {
    CancelButton,
    ChannelPicker,
    CheckBox,
    DatePicker,
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
  props: {
    mode: {
      type: String,
      default: "create",
    },
  },
  computed: {
    changesRequired() {
      // We do these checks:
      // - At least one channel is selected
      // - Title is included
      // - Start date and time are in the future
      // - Either a valid event URL or an address is included
      // console.log('Debug changes required', {
      //   title,
      //   startTime,
      //   address,
      //   virtualEventUrl,
      //   selectedCommunities
      // })
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
    getVirtualEventInfo() {
      if (this.virtualEventUrl) {
        return `virtualEventUrl: "${this.virtualEventUrl}"`;
      }
      return "";
    },
    getLocationInfo() {
      if (this.latitude && this.longitude) {
        return `
          locationName: ${this.locationName}
          location: {
            latitude: ${this.latitude}
            longitude: ${this.longitude}
          }
          address: ${this.address}
          placeId: ${this.placeId}
          isInPrivateResidence: ${this.isInPrivateResidence}
        `;
      }
      return "";
    },
    buildChannelString() {
      if (this.selectedChannels.length === 0) {
        throw new Error(
          "Cannot create an event without selecting at least one channel."
        );
      }
      let channelString = "";

      this.selectedChannels.forEach((channel: ChannelData) => {
        channelString += `
        {
          where: {
            node: {
              uniqueName: "${channel}"
            }
          }
        },`;
      });

      return `Channels: {
        connect: [${channelString}]
      }`;
    },
    buildTagString() {
      if (this.selectedTags.length === 0) {
        return "";
      }
      let tagString = "";

      this.selectedTags.forEach((tag: TagData) => {
        tagString += `
        {
          onCreate: {
            node: {
              text: ${tag}
            }
          }
          where: {
            node: {
              text: ${tag}
            }
          }
        },
        `;
      });
      return `Tags: {
        connectOrCreate: [${tagString}]
      }`;
    },
    buildDescriptionString() {
      if (!this.description) {
        return "";
      }
      return `description: "${this.description}""`;
    },
    async onSubmit1() {
      let CREATE_EVENT;
      let createEventMutationString;

      try {
        createEventMutationString = `
          mutation {
            createEvents(
              input: [
                {
                  title: "${this.title}"
                  ${this.buildDescriptionString()}
                  startTime: "${this.startTime}"
                  startTimeYear: "${this.startTimePieces.startTimeYear}"
                  startTimeMonth: "${this.startTimePieces.startTimeMonth}"
                  startTimeDayOfMonth: "${
                    this.startTimePieces.startTimeDayOfMonth
                  }"
                  startTimeDayOfWeek: "${
                    this.startTimePieces.startTimeDayOfWeek
                  }"
                  startTimeHourOfDay: ${this.startTimePieces.startTimeHourOfDay}
                  endTime: "${this.endTime}"
                  ${this.buildChannelString()}
                  ${this.buildTagString()}
                  ${this.getLocationInfo()}
                  ${this.getVirtualEventInfo()}
                  Poster: {
                    connect: {
                      where: {
                        node: {
                          username: "${this.username}"
                        }
                      }
                    }
                  }
                  cost: "${this.cost}"
                  canceled: false
                }
              ]
            ) {
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
        CREATE_EVENT = gql`
          ${createEventMutationString}
        `;
      } catch (err) {
        throw new Error(err + createEventMutationString);
      }

      const { mutate: createEvent } = useMutation(CREATE_EVENT, {
        errorPolicy: "all",
      });
      await createEvent()
      // {
      //   errorPolicy: "all",
      //   update(cache, { data: { events } }) {
      //     const newEventId = events.event[0].id;

      //     // Add a new comment section for each selected channel.
      //     // createCommentSections({
      //     //   variables: {
      //     //     commentSectionObjects: getCommentSectionObjects(newEventId),
      //     //   },
      //     // });

      //     // If the event was created in the context
      //     // of a channel, redirect to the event detail page in
      //     // the channel.
      //     if (this.channelId) {
      //       this.$router.push(`/c/${this.channelId}/event/${newEventId}`);
      //     } else {
      //       // If the event was created in the context
      //       // of the server-wide events page,
      //       // redirect to the event detail page in the first
      //       // channel that the event was submitted to.
      //       this.$router.push(
      //         `/c/${this.selectedChannels.value[0]}/event/${newEventId}`
      //       );
      //     }
      //     const newEvent = events.event[0];
      //     cache.modify({
      //       fields: {
      //         events(existingEventRefs = [], { readField }) {
      //           const newEventRef = cache.writeFragment({
      //             data: newEvent,
      //             fragment: gql`
      //               fragment NewEvent on Events {
      //                 id
      //               }
      //             `,
      //           });

      //           // Quick safety check - if the new event is already
      //           // present in the cache, we don't need to add it again.
      //           if (
      //             existingEventRefs.some(
      //               (ref: any) => readField("id", ref) === newEvent.id
      //             )
      //           ) {
      //             return existingEventRefs;
      //           }
      //           return [newEventRef, ...existingEventRefs];
      //         },
      //       },
      //     });
      //   },
      // }
      // );
      // if (createEventError) {
      //   throw new Error(createEventError.toString())
      // }
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
              <ChannelPicker
                v-if="channelData && channelData.channels"
                v-model="selectedChannels"
                :channel-options="getChannelOptionLabels(channelData.channels)"
                :selected-channels="selectedChannels"
                @setSelectedChannels="setSelectedChannels"
              />
            </FormRow>

            <FormRow :section-title="'Start Time'">
              <div class="sm:inline-block md:flex items-center md:space-x-2">
                <DatePicker
                  v-model="startTime"
                  :is-24="false"
                  :minutesIncrement="30"
                  :minDate="minStartTimeISO"
                />
              </div>
            </FormRow>
            <FormRow :section-title="'End Time'">
              <div class="sm:inline-block md:flex items-center md:space-x-2">
                <DatePicker
                  v-model="endTime"
                  :is-24="false"
                  :minutesIncrement="30"
                  @update:modelValue="updateStartTime"
                />
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

              <TagPicker
                class="mt-3 mb-3"
                v-if="tagsData && tagsData"
                v-model="selectedTags"
                :tag-options="getTagOptionLabels(tagsData.tags)"
                :selected-tags="selectedTags"
                @setSelectedTags="setSelectedTags"
              />
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

      <div class="pt-5">
        <div class="flex justify-end">
          <CancelButton />
          <SaveButton @click="onSubmit1" />
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