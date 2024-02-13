<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_DISCUSSION } from "@/graphQLData/discussion/queries";
import ErrorBanner from "@/components/generic/ErrorBanner.vue";
import { Issue } from "@/__generated__/graphql";
import LoadingSpinner from "../generic/LoadingSpinner.vue";
import { DateTime } from "luxon";
import { useRoute } from "vue-router";
import GenericButton from "../generic/buttons/GenericButton.vue";
import PrimaryButton from "../generic/buttons/PrimaryButton.vue";

export default defineComponent({
  components: {
    ErrorBanner,
    GenericButton,
    LoadingSpinner,
    PrimaryButton,
  },
  props: {
    issue: {
      type: Object as () => Issue,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();

    const discussionId = computed(() => {
      return props.issue.relatedDiscussionId;
    });

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    const {
      result: getDiscussionResult,
      error: getDiscussionError,
      loading: getDiscussionLoading,
    } = useQuery(GET_DISCUSSION, { id: discussionId });

    const discussion = computed(() => {
      if (getDiscussionLoading.value || getDiscussionError.value) {
        return null;
      }
      return getDiscussionResult.value.discussions[0];
    });

    const stepNames = {
      ViolatesRules: "ViolatesRules",
      SelectRules: "SelectRules",
      SelectAction: "SelectAction",
      SuspensionNeeded: "SuspensionNeeded",
      SuspensionLength: "SuspensionLength",
      SuspensionMessage: "SuspensionMessage",
      RequestChangeMessage: "RequestChangeMessage",
      CloseIssue: "CloseIssue",
      CloseIssueComment: "CloseIssueComment",
      FinishedWizard: "FinishedWizard",
    };

    const activeStep = ref(stepNames.ViolatesRules);
    const explanationComment = ref("");
    const brokenRules = ref("");
    const selectedPostAction = ref("");
    const selectedSuspensionLength = ref("");

    const postActions = [
      {
        id: "remove",
        title: `Remove the post from ${channelId.value}`,
      },
      {
        id: "hide",
        title: "Temporarily hide the post and request changes",
      },
      {
        id: "nothing",
        title: "Do nothing",
      },
    ];

    const suspensionLengths = [
      {
        id: "2days",
        title: "2 days",
      },
      {
        id: "2weeks",
        title: "2 weeks",
      },
      {
        id: "2months",
        title: "2 months",
      },
      {
        id: "indefinitely",
        title: "Indefinitely",
      },
    ];

    const suspensionMessage = computed(() => {
      return `
        Your post has been removed from ${
          channelId.value
        } for violating the following rules:
        ${brokenRules.value}

        As a result, you have been suspended from posting in ${
          channelId.value
        } ${
          selectedSuspensionLength.value === "indefinitely"
            ? "indefinitely"
            : `for ${selectedSuspensionLength.value}`
        }.

        If you believe this was done in error, please open a support ticket.
        `;
    });

    const requestChangeMessage = computed(() => {
      return `
        Your post has been hidden from ${channelId.value} for violating the following rules:
        ${brokenRules.value}

        Please edit your post to comply with the rules and then click the "Request Review" button.
        `;
    });

    return {
      activeStep,
      brokenRules,
      channelId,
      discussion,
      explanationComment,
      getDiscussionError,
      getDiscussionLoading,
      postActions,
      requestChangeMessage,
      selectedPostAction,
      selectedSuspensionLength,
      stepNames,
      suspensionLengths,
      suspensionMessage,
    };
  },
  methods: {
    formatDate(date: string) {
      return DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL);
    },
  },
});
</script>

<template>
  <div class="flex justify-center">
    <ErrorBanner v-if="getDiscussionError" :text="getDiscussionError.message" />
    <LoadingSpinner v-else-if="getDiscussionLoading" />
    <div v-else-if="discussion" class="mt-6 flex w-96 justify-center space-y-4">
      <div
        class="flex w-full flex-col space-y-4"
        v-if="activeStep === stepNames.ViolatesRules"
      >
        <h2 class="text-xl font-bold">Does the post violate the rules?</h2>
        <div class="flex justify-center gap-2">
          <GenericButton
            class="btn btn-primary"
            :text="'Yes'"
            @click="activeStep = stepNames.SelectRules"
          />
          <GenericButton
            class="btn btn-primary"
            :text="'No'"
            @click="activeStep = stepNames.CloseIssue"
          />
        </div>
      </div>

      <div
        v-if="activeStep === stepNames.SelectRules"
        class="flex w-full flex-col space-y-4"
      >
        <span
          class="cursor-pointer underline"
          @click="activeStep = stepNames.ViolatesRules"
          >Back</span
        >
        <h2 class="text-xl font-bold">What rules were broken?</h2>
        <textarea
          class="h-24 w-full rounded-lg border border-gray-300 p-2 text-black"
          :value="brokenRules"
          @input="brokenRules = $event?.target?.value || ''"
        />
        <div class="flex justify-center gap-2">
          <PrimaryButton
            class="btn btn-primary"
            :disabled="!brokenRules"
            :label="'Continue'"
            @click="activeStep = stepNames.SelectAction"
          />
        </div>
      </div>

      <div
        v-if="activeStep === stepNames.SelectAction"
        class="flex w-full flex-col space-y-4"
      >
        <span
          class="cursor-pointer underline"
          @click="activeStep = stepNames.SelectRules"
          >Back</span
        >
        <h2 class="text-xl font-bold">What do you want to do with the post?</h2>

        <fieldset class="mt-4">
          <legend class="sr-only">Post actions</legend>
          <div class="space-y-4">
            <div
              v-for="action in postActions"
              :key="action.id"
              class="flex items-center"
            >
              <input
                :id="action.id"
                name="post-action"
                type="radio"
                :checked="action.id === selectedPostAction"
                class="text-indigo-600 focus:ring-indigo-600 h-4 w-4 border-gray-300"
                @change="selectedPostAction = action.id"
              />
              <label
                :for="action.id"
                class="font-medium ml-3 block text-sm leading-6 text-gray-900 dark:text-gray-100"
              >
                {{ action.title }}</label
              >
            </div>
          </div>
        </fieldset>

        <div class="flex justify-center gap-2">
          <PrimaryButton
            class="btn btn-primary"
            :disabled="!selectedPostAction"
            :label="'Continue'"
            @click="
              () => {
                if (selectedPostAction === 'hide') {
                  activeStep = stepNames.RequestChangeMessage;
                } else if (selectedPostAction === 'remove') {
                  activeStep = stepNames.SuspensionNeeded;
                } else {
                  activeStep = stepNames.CloseIssue;
                }
              }
            "
          />
        </div>
      </div>

      <div
        v-if="activeStep === stepNames.RequestChangeMessage"
        class="flex w-full flex-col space-y-4"
      >
        <span
          class="cursor-pointer underline"
          @click="activeStep = stepNames.SelectAction"
          >Back</span
        >
        <h2 class="text-xl font-bold">
          This is the message that will be sent to the author to request changes
          to their post. Would you like to edit it?
        </h2>

        <textarea
          class="w-full rounded-lg border border-gray-300 p-2 text-black"
          :rows="10"
          :value="requestChangeMessage"
          @input="requestChangeMessage = $event?.target?.value || ''"
        />

        <div class="flex justify-center gap-2">
          <PrimaryButton
            class="btn btn-primary"
            :label="'Send Message'"
            @click="activeStep = stepNames.FinishedWizard"
          />
        </div>
      </div>

      <div
        v-if="activeStep === stepNames.SuspensionNeeded"
        class="flex w-full flex-col space-y-4"
      >
        <span
          class="cursor-pointer underline"
          @click="activeStep = stepNames.SelectAction"
          >Back</span
        >
        <h2 class="text-xl font-bold">
          Should the author be suspended from this forum?
        </h2>

        <div class="flex justify-center gap-2">
          <GenericButton
            class="btn btn-primary"
            :text="'Yes'"
            @click="activeStep = stepNames.SuspensionLength"
          />
          <GenericButton
            class="btn btn-primary"
            :text="'No'"
            @click="activeStep = stepNames.CloseIssue"
          />
        </div>
      </div>

      <div
        v-if="activeStep === stepNames.SuspensionLength"
        class="flex w-full flex-col space-y-4"
      >
        <span
          class="cursor-pointer underline"
          @click="activeStep = stepNames.SuspensionNeeded"
          >Back</span
        >
        <h2 class="text-xl font-bold">
          What should be the length of the suspension?
        </h2>

        <fieldset class="mt-4">
          <legend class="sr-only">Suspension Lengths</legend>
          <div class="space-y-4">
            <div
              v-for="length in suspensionLengths"
              :key="length.id"
              class="flex items-center"
            >
              <input
                :id="length.id"
                name="suspension-length"
                type="radio"
                :checked="length.title === selectedSuspensionLength"
                class="text-indigo-600 focus:ring-indigo-600 h-4 w-4 border-gray-300"
                @change="selectedSuspensionLength = length.title"
              />
              <label
                :for="length.id"
                class="font-medium ml-3 block text-sm leading-6 text-gray-900 dark:text-gray-100"
              >
                {{ length.title }}</label
              >
            </div>
          </div>
        </fieldset>
        <div class="flex justify-center gap-2">
          <PrimaryButton
            class="btn btn-primary"
            :disabled="!selectedSuspensionLength"
            :label="'Continue'"
            @click="activeStep = stepNames.SuspensionMessage"
          />
        </div>
      </div>

      <div
        v-if="activeStep === stepNames.SuspensionMessage"
        class="flex w-full flex-col space-y-4"
      >
        <span
          class="cursor-pointer underline"
          @click="activeStep = stepNames.SuspensionLength"
          >Back</span
        >
        <h2 class="text-xl font-bold">
          This is the message that will be sent to the author to notify them of
          their suspension. You can edit the message before sending it.
        </h2>

        <textarea
          class="w-full rounded-lg border border-gray-300 p-2 text-black"
          :rows="10"
          :value="suspensionMessage"
          @input="suspensionMessage = $event?.target?.value || ''"
        />
        <div class="flex justify-center gap-2">
          <PrimaryButton
            class="btn btn-primary"
            :label="'Send Message'"
            @click="activeStep = stepNames.FinishedWizard"
          />
        </div>
      </div>

      <div
        v-if="activeStep === stepNames.CloseIssue"
        class="flex w-full flex-col space-y-4"
      >
        <span
          class="cursor-pointer underline"
          @click="activeStep = stepNames.ViolatesRules"
          >Back</span
        >
        <h2 class="text-xl font-bold">Do you want to close the issue?</h2>
        <div class="flex justify-center gap-2">
          <GenericButton
            class="btn btn-primary"
            :text="'No'"
            @click="activeStep = stepNames.CloseIssueComment"
          />
          <PrimaryButton
            class="btn btn-primary"
            :label="'Yes'"
            @click="
              () => {
                $emit('close-issue', issue.id);
                activeStep = stepNames.CloseIssueComment;
              }
            "
          />
        </div>
      </div>

      <div
        v-if="activeStep === stepNames.CloseIssueComment"
        class="flex w-full flex-col space-y-4"
      >
        <span
          class="cursor-pointer underline"
          @click="activeStep = stepNames.CloseIssue"
          >Back</span
        >
        <h2 class="text-xl font-bold">
          Please leave a comment explaining your decision
        </h2>
        <div class="flex flex-col gap-2">
          <textarea
            class="w-full rounded-lg border border-gray-300 p-2 text-black"
            :value="explanationComment"
            @input="explanationComment = $event?.target?.value || ''"
          />
          <div class="flex justify-end gap-2">
            <GenericButton
              class="btn"
              :text="'Skip'"
              @click="activeStep = stepNames.FinishedWizard"
            />
            <PrimaryButton
              class="btn btn-primary"
              :label="'Submit'"
              :disabled="!explanationComment"
              @click="activeStep = stepNames.FinishedWizard"
            />
          </div>
        </div>
      </div>

      <div
        v-if="activeStep === stepNames.FinishedWizard"
        class="flex flex-col space-y-4"
      >
        <h2 class="text-xl font-bold">
          Thank you for your help moderating this forum
        </h2>
      </div>
    </div>
  </div>
</template>
