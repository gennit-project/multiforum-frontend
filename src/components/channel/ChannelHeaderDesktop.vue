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
    adminList: {
      type: Array,
      required: true,
    },
    channelId: {
      type: String,
      required: true,
    },
    channel: {
      type: Object,
      required: true,
    },
    route: {
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
  <ExpandableImage
    v-if="channel?.channelBannerURL"
    :src="channel?.channelBannerURL"
    :alt="'channel banner'"
    :is-square="true"
    class="max-h-24 w-full"
  />
  <div class="bg-white dark:bg-gray-800">
    <v-container
      fluid
      class="relative max-w-7xl flex-1 p-0 focus:outline-none xl:order-last"
    >
      <div
        class="flex justify-between border-b border-gray-200 pb-4 dark:border-gray-600 lg:px-6"
        :class="[channel?.channelBannerURL ? '-mt-4' : 'pt-2']"
      >
        <div class="align-items flex w-full gap-4">
          <ExpandableImage
            v-if="channel?.channelIconURL"
            class="ml-6 h-24 w-24 border-2 shadow-sm dark:border-gray-800"
            :rounded="true"
            :is-medium="true"
            :alt="channelId"
            :src="channel?.channelIconURL ?? ''"
          />
          <Avatar
            v-if="!channel?.channelIconURL"
            class="h-24 w-24 border-2 shadow-sm dark:border-gray-800"
            :text="channelId"
            :src="channel?.channelIconURL ?? ''"
            :is-medium="true"
            :is-square="false"
          />
          <div>
            <div>
              <div
                class="mt-8"
              >
                <h1
                  v-if="channelId"
                  class="rounded-full px-4 pt-1 flex mb-2 bg-white dark:bg-gray-900 border-gray-700 text-2xl font-bold leading-6 text-black dark:text-gray-200"
                >
                  {{ channel?.displayName ? channel.displayName : channelId }}
                </h1>
                <h2
                  v-if="channel?.uniqueName && channel?.displayName"
                  class="rounded-full px-4  bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-300 font-mono"
                >
                  {{ `${channel.uniqueName}` }}
                </h2>
              </div>
            </div>
          </div>
        </div>
        <CreateAnythingButton
          v-if="showCreateButton"
          class="mt-8 mr-6 lg:mr-0"
          :use-primary-button="true"
        />
      </div>
      <slot />
    </v-container>
  </div>
</template>
