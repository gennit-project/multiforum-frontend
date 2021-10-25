<script lang="ts">
import { defineComponent, computed, PropType } from "vue";
import DiscussionPreview from "./DiscussionPreview.vue";
import DiscussionListItem from "./DiscussionListItem.vue";
import { DiscussionData } from "../../types/discussionTypes";
import { useRoute } from "vue-router";



export default defineComponent({
  setup() {
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId || "";
    });
    return {
      channelId,
      selectedDiscussion: {},
    };
  },
  props: {
    discussions: {
      type: Array as PropType<Array<DiscussionData>>,
      default: () => { return [] }
    }
  },
  data() {
    return {
      previewIsOpen: false,
    };
  },
  components: {
    DiscussionPreview,
    DiscussionListItem,
  },
  methods: {
    openPreview(data: DiscussionData) {
      this.previewIsOpen = true;
      this.selectedDiscussion = data;
    },
    closePreview() {
      this.previewIsOpen = false;
    },
  },
});


</script>
<template>
  <ul role="list" class="divide-y divide-gray-200">
    <DiscussionListItem
      v-for="discussion in discussions"
      :key="discussion.id"
      :channel-id="discussion.channelId"
      :discussion="discussion"
      @openDiscussionPreview="openPreview"
    />
    <DiscussionPreview
      :isOpen="previewIsOpen"
      :discussion="selectedDiscussion"
      @closePreview="closePreview"
    />
  </ul>
</template>
