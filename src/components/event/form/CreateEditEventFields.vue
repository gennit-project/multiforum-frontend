<script lang="ts">
import { defineComponent, PropType, computed, ref, nextTick } from "vue";
import { ApolloError } from "@apollo/client/errors";
import ClockIcon from "@/components/icons/ClockIcon.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import TextEditor from "@/components/generic/TextEditor.vue";
import FormRow from "@/components/generic/FormRow.vue";
import Form from "@/components/generic/Form.vue";
import LocationIcon from "@/components/icons/LocationIcon.vue";
import TextInput from "@/components/generic/TextInput.vue";
import TagInput from "@/components/tag/TagInput.vue";
import PencilIcon from "@/components/icons/PencilIcon.vue";
import ErrorMessage from "@/components/generic/ErrorMessage.vue";
import CheckBox from "@/components/generic/CheckBox.vue";
import LocationSearchBar from "@/components/event/list/filters/LocationSearchBar.vue";
import ErrorBanner from "@/components/generic/ErrorBanner.vue";
import LinkIcon from "@/components/icons/LinkIcon.vue";
import TagIcon from "@/components/icons/TagIcon.vue";
// import TicketIcon from "@/components/icons/TicketIcon.vue";
import AnnotationIcon from "@/components/icons/AnnotationIcon.vue";
import { CreateEditEventFormValues } from "@/types/eventTypes";
import { checkUrl } from "@/utils/formValidation";
import { DateTime, Interval } from "luxon";

export default defineComponent({
  components: {
    AnnotationIcon,
    ChannelIcon,
    CheckBox,
    ClockIcon,
    ErrorBanner,
    ErrorMessage,
    TailwindForm: Form,
    FormRow,
    LinkIcon,
    LocationIcon,
    LocationSearchBar,
    PencilIcon,
    TagIcon,
    TagInput,
    TextEditor,
    TextInput,
    // TicketIcon,
  },
  props: {
    editMode: {
      type: Boolean,
      required: true,
    },
    createEventError: {
      type: Object as PropType<ApolloError | null>,
      default: () => {
        return null;
      },
    },
    formValues: {
      type: Object as PropType<CreateEditEventFormValues>,
      required: true,
    },
    getEventError: {
      type: Object as PropType<ApolloError | null>,
      default: () => {
        return null;
      },
    },
    updateEventError: {
      type: Object as PropType<ApolloError | null>,
      default: () => {
        return null;
      },
    },
    eventLoading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    // Time format options are in the Luxon documentation https://github.com/moment/luxon/blob/master/docs/formatting.md
    // TIME_SIMPLE yields the time in this format: 1:30 PM
    const timeFormat = "yyyy-MM-dd'T'HH:mm";

    const startTime = computed(() => {
      return new Date(props.formValues.startTime);
    });
    const endTime = computed(() => {
      return new Date(props.formValues.endTime);
    });

    const formattedStartTimeDate = computed(() => {
      const dateTime = DateTime.fromJSDate(startTime.value);
      return dateTime.toFormat("yyyy-MM-dd");
    });

    const formattedStartTimeTime = computed(() => {
      const dateTime = DateTime.fromJSDate(startTime.value);
      return dateTime.toFormat("HH:mm");
    });

    const formattedEndTimeDate = computed(() => {
      const dateTime = DateTime.fromJSDate(endTime.value);
      return dateTime.toFormat("yyyy-MM-dd");
    });

    const formattedEndTimeTime = computed(() => {
      const dateTime = DateTime.fromJSDate(endTime.value);
      return dateTime.toFormat("HH:mm");
    });

    function formatDateTime(dateTime: Date) {
      const date = new Date(dateTime);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    return {
      // Date format options are in the date-fns documentation https://date-fns.org/v2.29.2/docs/format
      formTitle: props.editMode ? "Edit Event" : "Create Event",
      startTime,
      endTime,
      touched: false,
      timeFormat,
      titleInputRef: ref(null),
      formatDateTime,
      formattedStartTimeDate,
      formattedStartTimeTime,
      formattedEndTimeDate,
      formattedEndTimeTime,
    };
  },
  computed: {
    datePickerErrorMessage() {
      if (this.startTime < new Date()) {
        return "Are you sure you want the start time to be in the past?";
      }
      if (this.startTime >= this.endTime) {
        return "The start time must be before the end time.";
      }
      return "";
    },
    duration() {
      return this.getDuration(
        this.startTime.toISOString(),
        this.endTime.toISOString()
      );
    },
    needsChanges() {
      // We do these checks:
      // - Title is included
      // console.log("Debug changes required", {
      //   title: this.formValues.title,
      // });
      // let now = DateTime.now().toISO();
      const needsChanges = !(
        (
          this.formValues.selectedChannels.length > 0 &&
          this.formValues.title.length > 0 &&
          this.startTime < this.endTime
        )
        // && this.startTime > now &&
        // ((this.address.length > 0 &&
        //   this.placeId &&
        //   this.latitude &&
        //   this.longitude) ||
        //   this.urlIsValid)
      );
      return needsChanges;
    },
    changesRequiredMessage() {
      if (this.formValues.selectedChannels.length === 0) {
        return "At least one channel must be selected.";
      }
      if (!this.formValues.title) {
        return "A title is required.";
      }

      return "";
    },
    urlIsValid() {
      return checkUrl(this.formValues.virtualEventUrl);
    },
  },
  created() {
    nextTick(() => {
      if (this.titleInputRef) {
        this.titleInputRef?.$el?.children[0].childNodes[0].focus();
      }
    });
  },
  methods: {
    handleStartTimeDateChange(dateTimeValue: string) {
      const inputDateTime = DateTime.fromISO(dateTimeValue);

      // Create a Luxon DateTime object from this.startTime
      let startTime = DateTime.fromJSDate(this.startTime);

      // Set the date portion of startTime to match that of timeValue
      startTime = startTime.set({
        year: inputDateTime.year,
        month: inputDateTime.month,
        day: inputDateTime.day,
      });

      // Convert the DateTime back to an ISO string
      const mergedValue = startTime.toISO();

      this.$emit("updateFormValues", { startTime: mergedValue });
    },
    handleStartTimeTimeChange(dateTimeValue: string) {
      // Parse the input date/time using Luxon
      const inputDateTime = DateTime.fromISO(dateTimeValue);

      // Create a Luxon DateTime object from this.startTime
      let startTime = DateTime.fromJSDate(this.startTime);

      // Set the time portion of startTime to match that of inputDateTime
      startTime = startTime.set({
        hour: inputDateTime.hour,
        minute: inputDateTime.minute,
        second: inputDateTime.second,
        millisecond: inputDateTime.millisecond,
      });

      // Convert the DateTime back to an ISO string
      const mergedValue = startTime.toISO();

      this.$emit("updateFormValues", { startTime: mergedValue });
    },
    handleEndTimeDateChange(dateTimeValue: string) {
      const inputDateTime = DateTime.fromISO(dateTimeValue);

      // Create a Luxon DateTime object from this.endTime
      let endTime = DateTime.fromJSDate(this.endTime);

      // Set the date portion of endTime to match that of timeValue
      endTime = endTime.set({
        year: inputDateTime.year,
        month: inputDateTime.month,
        day: inputDateTime.day,
      });

      // Convert the DateTime back to an ISO string
      const mergedValue = endTime.toISO();

      this.$emit("updateFormValues", { endTime: mergedValue });
    },
    handleEndTimeTimeChange(timeValue: string) {
      // Merge the date portion with the updated time portion
      const dateValue = this.endTime.toISOString().split("T")[0];
      const mergedValue = `${dateValue}T${timeValue}`;

      // Update the end time value
      this.endTime = mergedValue;

      this.$emit("updateFormValues", { endTime: mergedValue });
    },
    getDuration(startTime: string, endTime: string) {
      if (DateTime.fromISO(startTime) >= DateTime.fromISO(endTime)) {
        return "";
      }
      // Format time as "1h 30m"
      const obj = Interval.fromDateTimes(
        DateTime.fromISO(startTime),
        DateTime.fromISO(endTime)
      )
        .toDuration()
        .shiftTo("hours", "minutes")
        .toObject();

      if (!obj.hours) {
        return `${obj.minutes}m`;
      }
      if (!obj.minutes) {
        return `${obj.hours}h`;
      }
      return `${obj.hours}h ${obj.minutes}m`;
    },
    toggleCostField() {
      if (this.formValues?.free) {
        this.$emit("updateFormValues", {
          cost: "This event is not free.",
          free: false,
        });
      } else {
        this.$emit("updateFormValues", {
          cost: "",
          free: true,
        });
      }
    },
    togglePrivateResidenceField() {
      this.$emit("updateFormValues", {
        isInPrivateResidence: !this.formValues.isInPrivateResidence,
      });
    },
    setSelectedChannels(event: any) {
      this.$emit("setSelectedChannels", event);
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
    handleStartDateChange(event: any) {
      const startTimeISO = this.startTime.toISOString();
      const existingStartTimeObject = DateTime.fromISO(startTimeISO);
      const newStartTimeObject = DateTime.fromFormat(
        event,
        this.timeFormat
      ).toObject();

      const { day, month, year } = newStartTimeObject;
      // Only change the day/month/year so that we still keep the hours and minutes set by the time picker.
      // Convert the date back to a Javascript date for compatibility with the calendar date picker.
      const newStartTime = existingStartTimeObject
        .set({ day, month, year })
        .toISO();
      this.$emit("updateFormValues", { startTime: newStartTime });
      this.touched = true;
    },
    handleEndDateChange(event: any) {
      const endTimeISO = this.endTime.toISOString();
      const existingEndTimeObject = DateTime.fromISO(endTimeISO);
      const newEndTimeObject = DateTime.fromFormat(
        event,
        this.timeFormat
      ).toObject();

      const { day, month, year } = newEndTimeObject;
      const newEndTime = existingEndTimeObject
        .set({ day, month, year })
        .toISO();

      this.$emit("updateFormValues", { endTime: newEndTime });
      this.touched = true;
    },
    handleUpdateLocation(event: any) {
      if (!event.place_id) {
        throw new Error(
          "Could not find a Google place ID based on the form input."
        );
      }
      const {
        place_id,
        name,
        formatted_address,
        geometry: {
          location: { lat, lng },
        },
      } = event;
      this.$emit("updateFormValues", {
        placeId: place_id,
        locationName: name,
        address: formatted_address,
        latitude: lat(),
        longitude: lng(),
      });
    },
  },
});
</script>

<template>
  <v-container fluid>
    <v-row class="justify-center">
      <v-col
        cols="12"
        md="10"
        lg="10"
      >
        <div v-if="eventLoading">
          Loading...
        </div>
        <div v-else-if="getEventError">
          <div
            v-for="(error, i) of getEventError?.graphQLErrors"
            :key="i"
          >
            {{ error.message }}
          </div>
        </div>
        <TailwindForm
          v-else-if="formValues"
          class="pt-8 w-full"
          data-testid="event-form"
          :form-title="formTitle"
          :needs-changes="needsChanges"
          @input="touched = true"
          @submit="$emit('submit')"
        >
          <div class="divide-y divide-gray-200 w-full">
            <FormRow>
              <template #icon>
                <PencilIcon class="inline-flex float-right h-6 w-6" /><span
                  class="text-red-500"
                >*</span>
                <v-tooltip
                  activator="parent"
                  location="top"
                >
                  Title
                </v-tooltip>
              </template>
              <template #content>
                <TextInput
                  ref="titleInputRef"
                  :test-id="'title-input'"
                  :value="formValues.title"
                  :full-width="true"
                  :placeholder="'Add title'"
                  @update="$emit('updateFormValues', { title: $event })"
                />
              </template>
            </FormRow>
            <FormRow>
              <template #icon>
                <ChannelIcon class="float-right h-6 w-6" /><span
                  class="text-red-500"
                >*</span>
                <v-tooltip
                  activator="parent"
                  location="top"
                >
                  Channels
                </v-tooltip>
              </template>
              <template #content>
                <TagInput
                  :test-id="'channel-input'"
                  :selected-channels="formValues.selectedChannels"
                  :channel-mode="true"
                  @setSelectedTags="
                    $emit('updateFormValues', { selectedChannels: $event })
                  "
                />
              </template>
            </FormRow>
            <FormRow>
              <template #icon>
                <ClockIcon class="float-right h-6" />
                <v-tooltip
                  activator="parent"
                  location="top"
                >
                  Time
                </v-tooltip>
              </template>
              <template #content>
                <div class="inline-block xl:flex items-center my-2 space-x-2">
                  <div class="inline-block xl:flex items-center my-2 space-x-2">
                    <input
                      data-testid="start-time-date-input"
                      class="sl-input dark:bg-gray-800 cursor-pointer focus:ring-blue-500 focus:border-blue-500"
                      type="date"
                      placeholder="Date"
                      label="Start"
                      :value="formattedStartTimeDate"
                      @input="handleStartTimeDateChange($event?.target?.value)"
                    >
                    <input
                      data-testid="start-time-time-input"
                      class="sl-input dark:bg-gray-800 cursor-pointer focus:ring-blue-500 focus:border-blue-500"
                      type="time"
                      placeholder="Time"
                      label="Start Time"
                      :value="formattedStartTimeTime"
                      @input="handleStartTimeTimeChange($event?.target?.value)"
                    >
                  </div>

                  <div class="inline-block xl:flex items-center my-2 space-x-2">
                    <input
                      data-testid="end-time-date-input"
                      class="sl-input dark:bg-gray-800 cursor-pointer focus:ring-blue-500 focus:border-blue-500"
                      type="date"
                      placeholder="Date and Time"
                      label="Start"
                      :value="formattedEndTimeDate"
                      @input="handleEndTimeDateChange($event?.target?.value)"
                    >
                    <input
                      data-testid="end-time-time-input"
                      class="sl-input dark:bg-gray-800 cursor-pointer focus:ring-blue-500 focus:border-blue-500"
                      type="time"
                      placeholder="Time"
                      label="Start Time"
                      :value="formattedEndTimeTime"
                      @input="handleEndTimeTimeChange($event?.target?.value)"
                    >
                  </div>

                  <div>
                    {{ duration }}
                  </div>
                </div>
                <ErrorMessage :text="datePickerErrorMessage" />
              </template>
            </FormRow>
            <FormRow>
              <template #icon>
                <LinkIcon class="float-right h-6 w-6" />
                <v-tooltip
                  activator="parent"
                  location="top"
                >
                  Link
                </v-tooltip>
              </template>
              <template #content>
                <TextInput
                  data-testid="link-input"
                  :value="formValues.virtualEventUrl"
                  :use-v-model="true"
                  :full-width="true"
                  :placeholder="'Add a virtual event URL'"
                  @update="
                    $emit('updateFormValues', { virtualEventUrl: $event })
                  "
                />
                <ErrorMessage
                  :text="
                    touched &&
                      formValues.virtualEventUrl &&
                      formValues.virtualEventUrl.length > 0 &&
                      !urlIsValid
                      ? 'Must be a valid URL starting with https://'
                      : ''
                  "
                />
              </template>
            </FormRow>
            <FormRow>
              <template #icon>
                <LocationIcon
                  :wide="true"
                  class="float-right h-6 w-6"
                />
                <v-tooltip
                  activator="parent"
                  location="top"
                >
                  Location
                </v-tooltip>
              </template>
              <template #content>
                <LocationSearchBar
                  data-testid="location-input"
                  :search-placeholder="'Add an address'"
                  :full-width="true"
                  :reference-point-address-name="`${
                    formValues.locationName
                      ? `${formValues.locationName}, `
                      : ''
                  }${formValues.address ? formValues.address : ''}`"
                  @updateLocationInput="handleUpdateLocation"
                />
              </template>
            </FormRow>
            <FormRow>
              <template #icon>
                <AnnotationIcon class="float-right" />
                <v-tooltip
                  activator="parent"
                  location="top"
                >
                  Details
                </v-tooltip>
              </template>
              <template #content>
                <TextEditor
                  data-testid="description-input"
                  class="mb-3 h-56"
                  :disable-auto-focus="true"
                  :initial-value="formValues.description"
                  :placeholder="'Add details'"
                  @update="$emit('updateFormValues', { description: $event })"
                />
              </template>
            </FormRow>
            <FormRow>
              <template #icon>
                <TagIcon class="float-right h-6" />
                <v-tooltip
                  activator="parent"
                  location="top"
                >
                  Tags
                </v-tooltip>
              </template>
              <template #content>
                <TagInput
                  data-testid="tag-input"
                  :selected-tags="formValues.selectedTags"
                  @setSelectedTags="
                    $emit('updateFormValues', { selectedTags: $event })
                  "
                />
              </template>
            </FormRow>
            <FormRow>
              <template #icon>
                <VTooltip class="inline-flex">
                  <i class="fa-solid fa-ticket" />
                  <template #popper>
                    Cost to Attend
                  </template>
                </VTooltip>
              </template>
              <template #content>
                <CheckBox
                  data-testid="free-input"
                  class="align-middle"
                  :checked="formValues.free"
                  @input="toggleCostField"
                />
                <span class="ml-2 align-middle">This event is free</span>
                <TextInput
                  v-show="!formValues.free"
                  data-testid="cost-input"
                  :value="formValues.cost"
                  :full-width="true"
                  :placeholder="'Add cost details'"
                  @update="$emit('updateFormValues', { cost: $event })"
                />
              </template>
            </FormRow>
          </div>
          <ErrorBanner
            v-if="needsChanges && touched"
            :text="changesRequiredMessage"
          />
          <ErrorBanner
            v-if="createEventError"
            :text="createEventError.message"
          />
          <ErrorBanner
            v-if="updateEventError"
            :text="updateEventError.message"
          />
        </TailwindForm>
      </v-col>
    </v-row>
  </v-container>
</template>
<style lang="scss">
sl-input {
  border: 0 !important;
  padding: 0 !important;
  margin: 0, 0, 0, 0;
  border-color: blue;
  &::focus {
    border: 0 !important;
    outline: 0 !important;
  }
}
.sl-input::part(base):focus-visible {
  box-shadow: 0 0 0 3px rgba(7, 3, 255, 0.33);
}
.sl-input::part(input) {
  border: 0 !important;
  margin: 0, 0, 0, 0;
  font-family: "Inter", sans-serif;
  color: #000000;
  border-color: blue;
  font-size: 0.875rem;
  @apply dark:bg-gray-700;
  @apply dark:text-gray-300;
}
</style>
