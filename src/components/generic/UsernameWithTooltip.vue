<script lang="ts">
import { defineComponent } from "vue";
import { timeAgo } from "@/dateTimeUtils";
import Avatar from "../user/Avatar.vue";

export default defineComponent({
  name: "UsernameWithTooltip",
  components: {
    Avatar,
  },
  props: {
    username: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: false,
      default: "",
    },
    accountCreated: {
      type: String,
      required: false,
      default: "",
    },
    commentKarma: {
      type: Number,
      required: false,
      default: 0,
    },
    discussionKarma: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  setup() {
    return {
      timeAgo,
    };
  },
});
</script>
<template>
  <v-tooltip
    location="bottom"
    content-class="custom-tooltip"
  >
    <template #activator="{ props }">
      <button v-bind="props">
        <slot>
          <router-link
            :to="`/u/${username}`"
            class="flex flex-row gap-2 hover:underline"
          >
            <span
              v-if="!displayName"
              class="font-bold"
            >{{ username }}</span>
            <span
              v-if="displayName"
              class="font-bold"
            >{{ displayName }}</span>
            <span
              v-if="displayName"
              class="text-gray-500 dark:text-gray-300"
            >{{
              `u/${username}`
            }}</span>
          </router-link>
        </slot>
      </button>
    </template>
    <template #default>
      <div>
        <div>
          <div
            v-if="!displayName"
            class="text-md flex flex-col w-full font-bold"
          >
            <Avatar
              :text="username"
              :is-large="true"
            />{{ username }}
          </div>
          <div
            v-if="displayName"
            class="text-md flex flex-col gap-2"
          >
            <Avatar
              :text="username"
              :is-large="true"
            />
            <p class="text-lg font-bold">
              {{ displayName }}
            </p>
            <p class="text-sm text-gray-600 dark:text-white">
              {{ `u/${username}` }}
            </p>
          </div>
          <ul class="text-xs">
            <li>
              {{ `account created ${timeAgo(new Date(accountCreated))}` }}
            </li>
            <li>{{ `${commentKarma ?? 0} comment karma` }}</li>
            <li>{{ `${discussionKarma ?? 0} discussion karma` }}</li>
          </ul>
        </div>
      </div>
    </template>
  </v-tooltip>
</template>
