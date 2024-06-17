<script>
import { defineComponent } from "vue";
import ExpandableImage from "../generic/ExpandableImage.vue";
import CreateAnythingButton from "../nav/CreateAnythingButton.vue";
import Avatar from "../user/Avatar.vue";

export default defineComponent({
  name: "ChannelHeaderMobile",
  components: {
    Avatar,
    ExpandableImage,
    CreateAnythingButton,
  },
  props: {
    channelId: {
      type: String,
      required: true,
    },
    channel: {
      type: Object,
      required: true,
    },
    showCreateButton: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 bg-black">
    <ExpandableImage
      v-if="channel?.channelBannerURL"
      :src="channel?.channelBannerURL"
      :alt="'channel banner'"
      :is-medium="true"
      :is-square="true"
      class="w-full min-h-20"
    />
    <Avatar
      class="h-36 w-36 border-2 shadow-sm dark:border-gray-800"
      :text="channelId"
      :src="channel?.channelIconURL ?? ''"
      :is-medium="true"
      :is-square="false"
    />
    <div v-if="channel?.displayName && channel?.uniqueName">
      <div>
        <h1
          v-if="channel?.displayName"
          class="flex border-gray-700 text-2xl font-bold leading-6 text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
        >
          {{ channel.displayName }}
        </h1>
      </div>
      <h2
        class="text-sm font-mono leading-6 text-white dark:text-gray-300 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
      >
        {{ `${channel.uniqueName}` }}
      </h2>
    </div>
    <div v-else>
      <h1
        class="flex border-gray-700 text-2xl font-bold leading-6 text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
      >
        {{ channelId }}
      </h1>
    </div>
    <CreateAnythingButton
      v-if="showCreateButton"
      class="mb-4"
      :use-primary-button="true"
    />
  </div>
</template>
