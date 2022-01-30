<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
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
import ChannelPicker from "../ChannelPicker.vue";
import TagPicker from "../TagPicker.vue";
import DatePicker from "vue3-date-time-picker";
import "vue3-date-time-picker/dist/main.css";
import {
  getReadableTimeFromISO,
  durationHoursAndMinutes,
} from "@/dateTimeUtils";
import LocationSearchBar from "@/components/forms/LocationSearchBar.vue";
import { ADD_COMMENT_SECTION } from "@/graphQLData/comment/queries";
import { ADD_EVENT } from "@/graphQLData/event/mutations";
import CheckBox from "@/components/forms/CheckBox.vue";
const { DateTime } = require("luxon");

export default defineComponent({
  name: "CreateEditEvent",
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
  setup() {
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
        queryChannel {
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
      query getTags {
        queryTag {
          text
        }
      }
    `;

    const {
      loading: tagsLoading,
      error: tagsError,
      result: tagsData,
    } = useQuery(GET_TAGS);

    const getCommentSectionObjects = (newEventId: string) => {
      return selectedChannels.value.map((c) => {
        return {
          id: newEventId + c,
          Event: {
            id: newEventId,
          },
          Channel: {
            uniqueName: c,
          },
        };
      });
    };

    // let touched = ref({
    //   title: false,
    //   startDate: false,
    //   startTime: false,
    //   endTime: false,
    //   virtualEventUrl: false,
    //   address: false,
    // });

    const variablesForAnyEvent = computed(() => {
      return {
        poster: username,
        createdDate: DateTime.now().toISO(),
        title: title.value,
        description: description.value,
        startTime: startTime.value,
        endTime: endTime.value,
        startTimeYear: startTimePieces.value.startTimeYear,
        startTimeMonth: startTimePieces.value.startTimeMonth,
        startTimeDayOfMonth: startTimePieces.value.startTimeDayOfMonth,
        startTimeDayOfWeek: startTimePieces.value.startTimeDayOfWeek,
        startTimeHourOfDay: startTimePieces.value.startTimeHourOfDay,
        Channels: selectedChannels.value.map((c) => {
          return { uniqueName: c };
        }),
        Tags: selectedTags.value.map((t) => {
          return { text: t };
        }),
        cost: cost.value,
        canceled: false,
        virtualEventUrl: virtualEventUrl.value,
      };
    });

    const variablesForEventWithLocation = computed(() => {
      return {
        locationName: locationName.value,
        address: address.value,
        isInPrivateResidence: isInPrivateResidence.value,
        placeId: placeId.value,
        location: {
          latitude: latitude.value,
          longitude: longitude.value,
        },
      };
    });

    const getVariablesForAddEvent = () => {
      if (latitude.value && longitude.value) {
        return {
          ...variablesForAnyEvent.value,
          ...variablesForEventWithLocation.value,
        };
      }
      return variablesForAnyEvent.value;
    };

    const { mutate: addCommentSection } = useMutation(ADD_COMMENT_SECTION);

    const { mutate: addEvent, error: addEventError } = useMutation(ADD_EVENT, {
      errorPolicy: "all",
      update(cache, { data: { addEvent } }) {
        const newEventId = addEvent.event[0].id;

        // Add a new comment section for each selected community.
        addCommentSection({
          variables: {
            commentSectionObjects: getCommentSectionObjects(newEventId),
          },
        });

        // If the event was created in the context
        // of a community, redirect to the community.
        if (channelId) {
          this.$router.push(`/c/${channelId}/event/${newEventId}`);
        } else {
          // If the event was created in the context
          // of the server-wide events page,
          // redirect to the first community that the
          // event was submitted to.
          this.$router.push(
            `/c/${selectedChannels.value[0]}/event/${newEventId}`
          );
        }
        const newEvent = addEvent.event[0];
        cache.modify({
          fields: {
            queryEvent(existingEventRefs = [], { readField }) {
              const newEventRef = cache.writeFragment({
                data: newEvent,
                fragment: gql`
                  fragment NewEvent on Events {
                    url
                  }
                `,
              });

              // Quick safety check - if the new event is already
              // present in the cache, we don't need to add it again.
              if (
                existingEventRefs.some(
                  (ref: any) => readField("id", ref) === addEvent.id
                )
              ) {
                return existingEventRefs;
              }
              return [newEventRef, ...existingEventRefs];
            },
          },
        });
      },
    });

    return {
      addEvent,
      addEventError,
      address,
      channelData,
      channelError,
      channelLoading,
      cost,
      description,
      durationHoursAndMinutes,
      endTime,
      getReadableTimeFromISO,
      getVariablesForAddEvent,
      latitude,
      locationName,
      longitude,
      minStartTimeISO,
      now,
      placeId,
      selectedChannels,
      selectedTags,
      startTime,
      tagsData,
      tagsLoading,
      tagsError,
      title,
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
      // - At least one community is selected
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
    async onSubmit() {
      const variables = this.getVariablesForAddEvent();
      debugger;
      await this.addEvent(...variables);
      debugger;
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
    setTagFilters(tag: Array<string>) {
      this.selectedTags = tag;
    },
    setChannelFilters(channel: Array<string>) {
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
                v-if="channelData && channelData.queryChannel"
                v-model="selectedChannels"
                :channel-options="
                  getChannelOptionLabels(channelData.queryChannel)
                "
                :selected-channels="selectedChannels"
                @setChannelFilters="setChannelFilters"
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
                v-if="tagsData && tagsData.queryTag"
                v-model="selectedTags"
                :tag-options="getTagOptionLabels(tagsData.queryTag)"
                :selected-tags="selectedTags"
                @setTagFilters="setTagFilters"
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
          <SaveButton @click="onSubmit" />
        </div>
      </div>
    </Form>

    <div v-for="(error, i) of channelError?.graphQLErrors" :key="i">
      {{ error.message }}
    </div>
    <div v-for="(error, i) of tagsError?.graphQLErrors" :key="i">
      {{ error.message }}
    </div>
    <div v-for="(error, i) of addEventError?.graphQLErrors" :key="i">
      {{ error.message }}
    </div>
  </div>
</template>

<style>
</style>