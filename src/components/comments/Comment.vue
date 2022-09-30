<script>
import { defineComponent } from "vue";
import MdEditor from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import ProfileAvatar from "vue-profile-avatar";
import { relativeTime } from "../../dateTimeUtils";

export default defineComponent({
  components: {
    MdEditor,
    ProfileAvatar,
  },
  setup(props) {
    return {
      relativeTime,
      contentCopy: props.content,
    };
  },
  props: {
    authorUsername: {
      type: String,
      default: "",
    },
    createdAt: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    editedAt: {
      type: String,
      default: "",
    },
  },
});
</script>
<template>
  <div class="text-sm text-gray-500">
    <div class="flex space-x-4 mt-2">
      <ProfileAvatar
        class="w-5 h-5"
        v-if="authorUsername"
        :username="authorUsername"
        colorType="pastel"
      ></ProfileAvatar>
      <div class="align-middle">
        <h3 class="font-medium text-gray-900">
          <router-link
            v-if="authorUsername"
            class="underline font-bold"
            :to="`/u/${authorUsername}`"
          >
            {{ `${authorUsername ? authorUsername : "[deleted]"}` }}
          </router-link>
        </h3>
        <p>
          {{
            `Commented ${relativeTime("" + createdAt)} ${
              editedAt ? `&#8226; ${editedAt}` : ""
            }`
          }}
        </p>
      </div>
    </div>
    <md-editor
      class="mt-4"
      v-if="content"
      v-model="contentCopy"
      language="en-US"
      previewTheme="github"
      preview-only
    />
  </div>
</template>