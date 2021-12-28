<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    const notificationMethods = [
      { id: "email", title: "Email" },
      { id: "sms", title: "Phone (SMS)" },
      { id: "push", title: "Push notification" },
    ];
    return {
      notificationMethods,
    };
  },
});
</script>
<template>
  <form>
    <fieldset>
      <legend class="text-base font-medium text-gray-900">
        Filter Events by Date
      </legend>
      <div class="mt-4 space-y-4">
        <div>
          <label class="text-base font-medium text-gray-900"
            >Notifications</label
          >
          <p class="text-sm leading-5 text-gray-500">
            How do you prefer to receive notifications?
          </p>
          <fieldset class="mt-4">
            <legend class="sr-only">Notification method</legend>
            <div class="space-y-4">
              <div
                v-for="notificationMethod in notificationMethods"
                :key="notificationMethod.id"
                class="flex items-center"
              >
                <input
                  :id="notificationMethod.id"
                  name="notification-method"
                  type="radio"
                  :checked="notificationMethod.id === 'email'"
                  class="
                    focus:ring-indigo-500
                    h-4
                    w-4
                    text-indigo-600
                    border-gray-300
                  "
                />
                <label
                  :for="notificationMethod.id"
                  class="ml-3 block text-sm font-medium text-gray-700"
                >
                  {{ notificationMethod.title }}
                </label>
              </div>
            </div>
          </fieldset>
        </div>
        <div class="flex items-center">
          <input
            id="push-everything"
            name="push-notifications"
            type="radio"
            class="
              focus:ring-indigo-500
              h-4
              w-4
              text-indigo-600
              border border-gray-300
            "
          />
          <label
            for="push-everything"
            class="ml-3 block text-sm font-medium text-gray-700"
          >
            Show events in the next month
          </label>
        </div>
        <div class="flex items-center">
          <input
            id="push-everything"
            name="push-notifications"
            type="radio"
            class="
              focus:ring-indigo-500
              h-4
              w-4
              text-indigo-600
              border border-gray-300
            "
          />
          <label
            for="push-everything"
            class="ml-3 block text-sm font-medium text-gray-700"
          >
            Show events on the weekend
          </label>
        </div>
        <div class="flex items-center">
          <input
            id="push-email"
            name="push-notifications"
            type="radio"
            class="
              focus:ring-indigo-500
              h-4
              w-4
              text-indigo-600
              border border-gray-300
            "
          />
          <label
            for="push-email"
            class="ml-3 block text-sm font-medium text-gray-700"
          >
            Show past events
          </label>
        </div>
        <div class="flex items-center">
          <input
            id="push-nothing"
            name="push-notifications"
            type="radio"
            class="
              focus:ring-indigo-500
              h-4
              w-4
              text-indigo-600
              border border-gray-300
            "
          />
          <label
            for="push-nothing"
            class="ml-3 block text-sm font-medium text-gray-700"
          >
            Show events between two dates
          </label>
        </div>
        <div class="flex items-center">
          <input
            id="push-nothing"
            name="push-notifications"
            type="radio"
            class="
              focus:ring-indigo-500
              h-4
              w-4
              text-indigo-600
              border border-gray-300
            "
          />
          <label
            for="push-nothing"
            class="ml-3 block text-sm font-medium text-gray-700"
          >
            Show events on a certain date
          </label>
        </div>
      </div>
    </fieldset>
  </form>
</template>