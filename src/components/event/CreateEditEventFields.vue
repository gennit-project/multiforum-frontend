<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ApolloError } from "@apollo/client/errors";
import ClockIcon from "@/components/icons/ClockIcon.vue";
import UserAddIcon from "@/components/icons/UserAddIcon.vue";
import TextEditor from "@/components/forms/TextEditor.vue";
import FormRow from "@/components/forms/FormRow.vue";
import Form from "@/components/forms/Form.vue";
import LocationIcon from "@/components/icons/LocationIcon.vue";
import TextInput from "@/components/forms/TextInput.vue";
import TagInput from "@/components/forms/TagInput.vue";
import PencilIcon from "@/components/icons/PencilIcon.vue";
import ErrorMessage from "@/components/forms/ErrorMessage.vue";
import CheckBox from "@/components/forms/CheckBox.vue";
import LocationSearchBar from "@/components/forms/LocationSearchBar.vue";
import ErrorBanner from "@/components/forms/ErrorBanner.vue";
import LinkIcon from "../icons/LinkIcon.vue";
import TagIcon from "../icons/TagIcon.vue";
import TicketIcon from "../icons/TicketIcon.vue";
import AnnotationIcon from "../icons/AnnotationIcon.vue";
import HomeIcon from "../icons/HomeIcon.vue"
import DatePicker from 'vue3-datepicker'
import { CreateEditEventFormValues } from "@/types/eventTypes";
import { checkUrl } from "@/utils/formValidation";

export default defineComponent({
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
      required: false,
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
  components: {
    UserAddIcon,
    CheckBox,
    ClockIcon,
    DatePicker,
    ErrorBanner,
    ErrorMessage,
    HomeIcon,
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
    TicketIcon,
    AnnotationIcon,
    DatePicker
},
  data(props) {
    return {
      touched: false,
      formTitle: props.editMode ? "Edit Event" : "Create Event",
      startTime: new Date(props.formValues?.startTime || '')
    };
  },

  computed: {
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
          this.formValues.title.length > 0
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
  methods: {
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
    togglePrivateResidenceField(){
      this.$emit("updateFormValues", {
        isInPrivateResidence: !this.formValues.isInPrivateResidence
      })
    },
    setSelectedChannels(event: any) {
      this.$emit("setSelectedChannels", event);
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
  },
});
</script>

<template>
  <div>
    <div v-if="eventLoading">Loading...</div>
    <div v-else-if="getEventError">
      <div v-for="(error, i) of getEventError?.graphQLErrors" :key="i">
        {{ error.message }}
      </div>
    </div>
    <TailwindForm
      v-else-if="formValues"
      :form-title="formTitle"
      :needs-changes="needsChanges"
      @input="touched = true"
      @submit="$emit('submit')"
    >
      <div class="pr-8">
        <FormRow>
          <template v-slot:icon>
            <PencilIcon class="float-right" />
          </template>
          <template v-slot:content>
            <TextInput
              :value="formValues.title"
              :full-width="true"
              :placeholder="'Add title'"
              @update="$emit('updateFormValues', { title: $event })"
            />
          </template>
        </FormRow>
        <FormRow>
          <template v-slot:icon>
            <UserAddIcon :wide="true" class="float-right" />
          </template>
          <template v-slot:content>
            <TagInput
              :selected-channels="formValues.selectedChannels"
              :channel-mode="true"
              @setSelectedTags="
                $emit('updateFormValues', { selectedChannels: $event })
              "
            />
          </template>
        </FormRow>
        <FormRow>
          <template v-slot:icon>
            <ClockIcon class="float-right" />
          </template>
          <template v-slot:content>
            <div class="sm:inline-block md:flex items-center md:space-x-2">
                <DatePicker
                  class="focus:ring-blue-500 focus:border-blue-500 mt-1 pt-2.5 pb-2.5 flex-1 block min-w-0 rounded sm:text-sm border-gray-300"
                  v-model="startTime"
                  :input-format="'MM/dd/yyyy'"
                  @update:modelValue="$emit('updateFormValues', { startTime: $event.toISOString() })"
                />
            </div>
          </template>
        </FormRow>
        <FormRow>
          <template v-slot:icon>
            <LinkIcon class="float-right" />
          </template>
          <template v-slot:content>
            <TextInput
              :value="formValues.virtualEventUrl"
              :use-v-model="true"
              :full-width="true"
              :placeholder="'Add a virtual event URL'"
              @update="$emit('updateFormValues', { virtualEventUrl: $event })"
            />
            <ErrorMessage
              :text="
                touched &&
                formValues.virtualEventUrl &&
                formValues.virtualEventUrl.length > 0 &&
                !urlIsValid
                  ? 'URL is invalid.'
                  : ''
              "
            />
          </template>
        </FormRow>
        <FormRow>
          <template v-slot:icon>
            <LocationIcon :wide="true" class="float-right" />
          </template>
          <template v-slot:content>
            <LocationSearchBar
              :search-placeholder="'Add an address'"
              :full-width="true"
              :reference-point-address-name="formValues.address"
              @updateLocationInput="$emit('updateLocationInput', $event)"
            />
          </template>
        </FormRow>
        <FormRow>
          <template v-slot:icon>
            <AnnotationIcon class="float-right" />
          </template>
          <template v-slot:content>
            <TextEditor
              class="mb-3"
              :initial-value="formValues.description"
              :placeholder="'Add details'"
              @update="$emit('updateFormValues', { description: $event })"
            />
          </template>
        </FormRow>
        <FormRow>
          <template v-slot:icon>
            <TagIcon class="float-right" />
          </template>
          <template v-slot:content>
            <TagInput
              :selected-tags="formValues.selectedTags"
              @setSelectedTags="
                $emit('updateFormValues', { selectedTags: $event })
              "
            />
          </template>
        </FormRow>
        <FormRow>
          <template v-slot:icon>
            <HomeIcon class="float-right" />
          </template>
          <template v-slot:content>
            <CheckBox
              class="align-middle"
              :checked="formValues.isInPrivateResidence"
              @input="togglePrivateResidenceField"
            />
            <span class="ml-2 align-middle">This event is in a private residence</span>
          </template>
        </FormRow>
        <FormRow>
          <template v-slot:icon>
            <TicketIcon class="float-right" />
          </template>
          <template v-slot:content>
            <CheckBox
              class="align-middle"
              :checked="formValues.free"
              @input="toggleCostField"
            />
            <span class="ml-2 align-middle">This event is free</span>
            <TextInput
              v-show="!formValues.free"
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
      <ErrorBanner v-if="createEventError" :text="createEventError.message" />
      <ErrorBanner v-if="updateEventError" :text="updateEventError.message" />
    </TailwindForm>
  </div>
</template>
<style>
</style>
