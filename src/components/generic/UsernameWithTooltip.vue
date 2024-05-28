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
    src: {
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
    isAdmin: {
      type: Boolean,
      required: false,
      default: false,
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
  <v-tooltip location="bottom" content-class="custom-tooltip">
    <template #activator="{ props }">
      <button v-bind="props">
        <slot>
          <router-link
            :to="`/u/${username}`"
            class="flex flex-row hover:underline"
          >
            <span v-if="!displayName" class="font-bold">{{ username }}</span>
            <span v-if="displayName" class="font-bold">{{ displayName }}</span>
            <span v-if="displayName" class="text-gray-500 dark:text-gray-300">{{
              `u/${username}`
            }}</span>
            <span v-if="isAdmin" class="text-sm text-blue-500">Admin</span>
          </router-link>
        </slot>
      </button>
    </template>
    <template #default>
      <div>
        <div v-if="!displayName" class="text-md flex w-full flex-col">
          <Avatar :text="username" :src="src" :is-medium="true" />{{ username }}
        </div>
        <div v-if="displayName" class="text-md flex w-full flex-col">
          <Avatar :text="username" :src="src" :is-medium="true" />
          <p class="text-xs font-bold">
            {{ displayName }}
          </p>
          <p class="text-xs text-gray-600 dark:text-white">
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
    </template>
  </v-tooltip>
</template>