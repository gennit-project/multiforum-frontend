<script lang="ts">
import { defineComponent } from "vue";
import CreateRootCommentForm from "@/components/comments/CreateRootCommentForm.vue";
// The purpose of this component is to wrap the CreateRootCommentForm component
// and put the event-specific logic in here. This is because the CreateRootCommentForm
// component is used to put comments on discussions as well, and we don't want to duplicate
// what is the same between them.

export default defineComponent({
  name: "EventRootCommentFormWrapper",
  components: {
    CreateRootCommentForm,
  },
  props: {
    link: {
      type: String,
      default: "",
    },
    dataTestid: {
      type: String,
      default: "",
    },
  },
  setup() {},
});
</script>

<template>
    <div>
        <!-- <CreateRootCommentForm 
            :key="`${channelId}${discussionId}`"
            :channel-id="channelId"
            :discussion-channel="activeDiscussionChannel"
            :previous-offset="previousOffset"
        /> -->
    </div>
   
</template>
