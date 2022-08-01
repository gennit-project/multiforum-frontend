<script lang="ts">
import { defineComponent, PropType } from "vue";
import { TagData } from "@/types/tagTypes";
import { ApolloError } from "@apollo/client/errors";
import ClockIcon from "@/components/icons/ClockIcon.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import CancelButton from "@/components/buttons/CancelButton.vue";
import SaveButton from "@/components/buttons/SaveButton.vue";
import TextEditor from "@/components/forms/TextEditor.vue";
import FormTitle from "@/components/forms/FormTitle.vue";
import FormRow from "@/components/forms/FormRow.vue";
import Form from "@/components/forms/Form.vue";
import LocationIcon from "@/components/icons/LocationIcon.vue";
import TextInput from "@/components/forms/TextInput.vue";
import TagPicker from "@/components/forms/TagPicker.vue";
import PencilIcon from "@/components/icons/PencilIcon.vue";
import ErrorMessage from "@/components/forms/ErrorMessage.vue";
import CheckBox from "@/components/forms/CheckBox.vue";
import LocationSearchBar from "@/components/forms/LocationSearchBar.vue";
import ErrorBanner from "@/components/forms/ErrorBanner.vue";
import { EventData } from "@/types/eventTypes";

export default defineComponent({
  props: {
    changesRequired: {
      type: Boolean,
      required: true,
    },
    changesRequiredMessage: {
      type: String,
      required: true,
    },
    channelError: {
      type: Object as PropType<ApolloError>,
      required: false,
    },
    channelLoading: {
      type: Boolean,
      required: true,
    },
    channelOptionLabels: {
      type: Array as PropType<Array<string>>,
      default: () => {return []},
    },
    cost: {
      type: String,
      required: true,
    },
    createEventError: {
      type: Object as PropType<ApolloError | null>,
      default: () => {return null}
    },
    description: {
      type: String,
      required: true,
    },
    editMode: {
      type: Boolean,
      required: true,
    },
    eventData: {
      type: Object as PropType<EventData>,
      required: false,
    },
    showCostField: {
      type: Boolean,
      required: true,
    },
    selectedChannels: {
      type: Array as PropType<Array<string>>,
      required: true,
    },
    selectedTags: {
      type: Array as PropType<Array<string>>,
      required: true,
    },
    tagOptionLabels: {
      type: Array as PropType<Array<string>>,
      required: true,
    },
    tagsError: {
      type: Object as PropType<ApolloError>,
      required: false,
    },
    tagsLoading: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    urlIsValid: {
      type: Boolean,
      required: true,
    },
    virtualEventUrl: {
      type: String,
      required: true,
    },
  },
  components: {
    CancelButton,
    ChannelIcon,
    CheckBox,
    ClockIcon,
    ErrorBanner,
    ErrorMessage,
    TailwindForm: Form,
    FormRow,
    FormTitle,
    LocationIcon,
    LocationSearchBar,
    PencilIcon,
    SaveButton,
    TagPicker,
    TextEditor,
    TextInput,
  },
  setup() {
    return {
      touched: false,
    };
  },
  data(props) {
    return {
      formTitle: props.editMode ? "Edit" : "Create"
    }
  }
});
</script>

<template>
  <div>
    <TailwindForm @input="touched = true">
      <div v-if="channelLoading || tagsLoading || (editMode && !eventData)">
        Loading...
      </div>
      <div v-if="!editMode || editMode && !eventData" class="divide-y divide-gray-200 sm:space-y-5">
        <div>
          <FormTitle> {{ formTitle }} </FormTitle>
          <div>
            <FormRow>
              <template v-slot:icon>
                <PencilIcon class="float-right" />
              </template>
              <template v-slot:content>
                <TextInput
                  :value="title"
                  :full-width="true"
                  :placeholder="'Add title'"
                  @update="$emit('updateTitle')"
                />
              </template>
            </FormRow>

            <FormRow>
              <template v-slot:icon>
                <ChannelIcon :wide="true" class="float-right" />
              </template>
              <template v-slot:content>
                <TextInput
                  :full-width="true"
                  :placeholder="'Add channel(s)'"
                  @update="$emit('updateTitle')"
                />
                <TagPicker
                  :tag-options="channelOptionLabels"
                  :initial-value="selectedChannels"
                  @setSelectedTags="$emit('setSelectedChannels')"
                />
              </template>
            </FormRow>

            <FormRow>
              <template v-slot:icon>
                <ClockIcon class="float-right" />
              </template>
              <template v-slot:content>
                <div class="sm:inline-block md:flex items-center md:space-x-2">
                  <!-- <DatePicker
                    v-model="startTime"
                    :is-24="false"
                    :minutesIncrement="30"
                    :minDate="minStartTimeISO"
                    @update="updateStartTime"
                  /> -->
                </div>
              </template>
            </FormRow>

            <FormRow>
              <template v-slot:icon>
                <LocationIcon :wide="true" class="float-right" />
              </template>
              <template v-slot:content>
                <TextInput
                  :value="virtualEventUrl"
                  :full-width="true"
                  :placeholder="'Add a virtual event URL'"
                  @update="$emit('updateVirtualEventUrl')"
                />
                <ErrorMessage
                  :text="touched && !urlIsValid ? 'URL is invalid.' : ''"
                />
              </template>
            </FormRow>

            <FormRow :section-title="'Address'">
              <template v-slot:content>
                <LocationSearchBar
                  :search-placeholder="'Location'"
                  :full-width="true"
                  @updateLocationInput="$emit('updateLocationInput')"
                />
              </template>
            </FormRow>

            <FormRow :section-title="'More Info'">
              <template v-slot:content>
                <TextEditor
                  class="mb-3"
                  :value="description"
                  @update="$emit('updateDescription')"
                />
                <TagPicker
                  class="mt-3 mb-3"
                  :initial-value="selectedTags"
                  :tag-options="tagOptionLabels"
                  :selected-tags="selectedTags"
                  @setSelectedTags="$emit('setSelectedTags')"
                />
                <CheckBox
                  :checked="!showCostField"
                  @input="$emit('toggleCostField')"
                />
                <span class="ml-2">This event is free</span>
              </template>
            </FormRow>

            <FormRow :section-title="'Cost'" v-show="showCostField">
              <template v-slot:content>
                <TextInput
                  :value="cost"
                  :full-width="true"
                  @update="$emit('updateCost')"
                />
              </template>
            </FormRow>
          </div>
        </div>
      </div>
      <ErrorBanner v-if="changesRequired" :text="changesRequiredMessage" />
      <ErrorBanner v-if="createEventError" :text="createEventError.message" />

      <div class="pt-5">
        <div class="flex justify-end">
          <CancelButton @click="$emit('cancel')" />
          <SaveButton
            @click.prevent="$emit('submit')"
            :disabled="changesRequired"
          />
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
