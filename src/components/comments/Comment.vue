<script>
import { defineComponent, readonly } from "vue";
import MdEditor from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import { relativeTime } from "../../dateTimeUtils";

export default defineComponent({
  components: {
    MdEditor,
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
    readonly: {
      type: Boolean,
      default: false,
    }
  },
});
</script>
<template>
  <div class="text-sm">
    <div class="flex space-x-4 mt-2">
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
        <p class="text-gray-500">
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
      v-if="content && readonly"
      v-model="content"
      language="en-US"
      previewTheme="github"
      preview-only
    />
    <md-editor
      class="mt-4"
      v-if="content && !readonly"
      v-model="contentCopy"
      language="en-US"
      previewTheme="github"
    />
  </div>
</template>