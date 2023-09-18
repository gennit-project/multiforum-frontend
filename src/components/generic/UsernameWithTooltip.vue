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
  <v-tooltip location="bottom" content-class="custom-tooltip">
    <template v-slot:activator="{ props }">
      <button v-bind="props">
        <slot>
          {{ username }}
        </slot>
      </button>
    </template>
    <template v-slot:default>
      <div>
        <Avatar :text="username" />
        <div>
          <p class="text-md font-bold">{{ username }}</p>
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
