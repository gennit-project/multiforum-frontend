<script lang="ts">
import { defineComponent } from "vue";
import { ActivityFeedItem } from "@/__generated__/graphql";
import Avatar from "../user/Avatar.vue";
import DiscussionIcon from "../icons/DiscussionIcon.vue";
import { timeAgo } from "@/dateTimeUtils";

// Enum for the allowed action types
enum ActionType {
  Close = "close",
  Comment = "comment",
  Hide = "hide",
  Remove = "remove",
  Reopen = "reopen",
  Report = "report",
  Suspend = "suspend",
  Unhide = "unhide",
  Unsuspend = "unsuspend",
}

const actionTypeToIcon = {
  [ActionType.Close]: "fa-regular fa-circle-check",
  [ActionType.Comment]: "fa-regular fa-comment",
  [ActionType.Hide]: "fa-solid fa-eye-slash",
  [ActionType.Remove]: "fa-solid fa-xmark",
  [ActionType.Reopen]: "fa-solid fa-arrows-rotate",
  [ActionType.Report]: "fa-regular fa-flag",
  [ActionType.Suspend]: "fa-solid fa-user-lock",
  [ActionType.Unhide]: "fa-solid fa-eye",
  [ActionType.Unsuspend]: "fa-solid fa-user-plus",
};

export default defineComponent({
  components: {
    Avatar,
    DiscussionIcon,
  },
  props: {
    feedItems: {
      type: Array as () => ActivityFeedItem[],
      required: true,
    },
  },

  setup() {
    return {
      actionTypeToIcon,
      items: [
        {
          id: "a4d36a78-a7db-429c-a652-adcf5919c449",
          actionDescription: "Reopened the issue",
          actionType: "reopen",
          createdAt: "2024-02-19T05:11:16.614Z",
          ModerationProfile: {
            displayName: "freshManySlimyShoe",
          },
        },
        {
          id: "0cf01b7b-5ffd-4ced-ae95-c3a665251ed2",
          actionDescription: "Removed the post from the forum",
          actionType: "remove",
          createdAt: "2024-02-19T05:09:04.598Z",
          ModerationProfile: {
            displayName: "freshManySlimyShoe",
          },
        },
        {
          id: "cb496866-660c-4821-91a2-6e427f677813",
          actionDescription: "Temporarily hid the post and requested changes",
          actionType: "hide",
          createdAt: "2024-02-19T04:57:36.905Z",
          ModerationProfile: {
            displayName: "freshManySlimyShoe",
          },
        },
        {
          id: "1af5ebd8-e41d-4e09-bde6-1456df547f7e",
          actionDescription: "suspended the author",
          actionType: "suspend",
          createdAt: "2024-02-19T04:57:36.905Z",
          ModerationProfile: {
            displayName: "freshManySlimyShoe",
          },
        },
        {
          id: "63f598d4-1e3d-4d3c-ad38-4d2e6a310081",
          actionDescription: "Commented on the issue",
          actionType: "comment",
          createdAt: "2024-02-19T04:57:36.905Z",
          ModerationProfile: {
            displayName: "freshManySlimyShoe",
          },
        },
        {
          id: "a5c788e4-0a77-4501-b2c9-2082b3690861",
          actionDescription: "Un-hid the post",
          actionType: "unhide",
          createdAt: "2024-02-19T04:57:36.905Z",
          ModerationProfile: {
            displayName: "freshManySlimyShoe",
          },
        },
        {
          id: "d4c20b3a-2972-45b3-864d-25cf132cfb55",
          actionDescription: "Closed the issue",
          actionType: "close",
          createdAt: "2024-02-19T04:57:36.905Z",
          ModerationProfile: {
            displayName: "freshManySlimyShoe",
          },
        },
        {
          id: "f87f5bc4-f098-4274-a832-f2b006605961",
          actionDescription: "Reported the discussion again",
          actionType: "report",
          createdAt: "2024-02-19T04:57:36.905Z",
          ModerationProfile: {
            displayName: "freshManySlimyShoe",
          },
        },
        {
          id: "2c140ced-a0d6-472b-a57f-3a0492e09659",
          actionDescription: "Reported the discussion",
          actionType: "report",
          createdAt: "2024-02-19T04:45:34.846Z",
          ModerationProfile: {
            displayName: "freshManySlimyShoe",
          },
        },
      ],
      timeAgo,
    };
  },
});
</script>

<template>
  <div class="flow-root">
    <ul
      role="list"
      class="-mb-8"
    >
      <li
        v-for="(activityItem, activityItemIdx) in items"
        :key="activityItem.id"
      >
        <div class="relative pb-8">
          <span
            v-if="activityItemIdx !== items.length - 1"
            class="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-600"
            aria-hidden="true"
          />
          <div class="relative flex items-start space-x-3">
            <template v-if="activityItem.actionType === 'comment'">
              <div class="relative">
                <Avatar
                  v-if="activityItem.ModerationProfile?.displayName"
                  class="z-10"
                  :is-small="true"
                  :text="activityItem.ModerationProfile.displayName"
                />

                <span
                  class="absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px dark:bg-gray-600"
                >
                  <DiscussionIcon
                    class="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </div>
              <div class="min-w-0 flex-1">
                <div>
                  <div class="text-sm">
                    <router-link
                      v-if="activityItem.ModerationProfile?.displayName"
                      :to="{
                        name: 'ModProfile',
                        params: {
                          modId: activityItem.ModerationProfile.displayName,
                        },
                      }"
                      class="font-medium text-gray-900 hover:underline dark:text-gray-200"
                    >
                      {{
                        activityItem.ModerationProfile?.displayName
                      }}
                    </router-link>
                  </div>
                  <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-300">
                    Commented
                    {{ `${timeAgo(new Date(activityItem.createdAt))}` }}
                  </p>
                </div>
                <div class="mt-2 text-sm text-gray-700 dark:text-gray-200">
                  <p>{{ activityItem.actionDescription }}</p>
                </div>
              </div>
            </template>

            <template v-else>
              <div>
                <div class="relative px-1">
                  <div
                    :class="`flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white dark:bg-gray-600 dark:text-white dark:ring-gray-800`"
                  >
                    <i
                      :class="[`${actionTypeToIcon[activityItem.actionType]}`]"
                    />
                  </div>
                </div>
              </div>
              <div class="min-w-0 flex-1 py-0">
                <div class="text-sm leading-8 text-gray-500 dark:text-gray-300">
                  <span class="mr-0.5">
                    <router-link
                      v-if="activityItem.ModerationProfile?.displayName"
                      :to="{
                        name: 'ModProfile',
                        params: {
                          modId: activityItem.ModerationProfile.displayName,
                        },
                      }"
                      class="font-medium text-gray-900 hover:underline dark:text-gray-200"
                    >{{
                      activityItem.ModerationProfile?.displayName
                    }}</router-link>
                    {{ activityItem.actionDescription }}
                  </span>
                  {{ " " }}

                  <span class="whitespace-nowrap">{{
                    `${timeAgo(new Date(activityItem.createdAt))}`
                  }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
