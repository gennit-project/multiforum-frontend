<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import DiscussionPreview from "./DiscussionPreview.vue";
import DiscussionListItem from "./DiscussionListItem.vue";
import { DiscussionData } from "../../types/discussionTypes";
import { useRoute } from 'vue-router';

export default defineComponent({
  setup(props) {
    const route = useRoute()
    const channelId = computed(() => {
      return route.params.channelId || ""
    })
    const resultsAggregate = computed(() => {

      if (props.discussions.length === 1) {
        return '1 Result'
      }
      if (props.discussions.length > 1) {
        return `${props.discussions.length} Results`
      }
      return '0 Results'
    })
    return {
      selectedDiscussion: {},
      resultsAggregate,
      channelId
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
  inheritAttrs: false
});


</script>
<template>
<div class="divide-y divide-gray-200 mx-auto max-w-5xl">
  <p class="px-8">{{ resultsAggregate }}</p>
  <ul role="list" class="px-8 divide-y divide-gray-200 relative">
    <DiscussionListItem
      v-for="discussion in discussions"
      :key="discussion.id"
      :discussion="discussion"
      :current-channel-id="channelId"
      @openDiscussionPreview="openPreview"
    />
    <DiscussionPreview
      :isOpen="previewIsOpen"
      :discussion="selectedDiscussion"
      @closePreview="closePreview"
    />
  </ul>
</div>
</template>
