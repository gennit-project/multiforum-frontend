<script lang="ts">
import { defineComponent } from "vue";
import DiscussionPreview from "./DiscussionPreview.vue";
import DiscussionListItem from "./DiscussionListItem.vue";
import { DiscussionData } from "../../types/discussionTypes";

const discussions = [
  {
    id: 1,
    author: "Velit placeat sit ducimus non sed",
    title: "Discussion title 1",
    time: "1d ago",
    dateTime: "2021-01-27T16:35",
    body: "Doloremque dolorem maiores assumenda dolorem facilis. Velit vel in a rerum natus facere. Enim rerum eaque qui facilis. Numquam laudantium sed id dolores omnis in. Eos reiciendis deserunt maiores et accusamus quod dolor.",
    preview:
      "Doloremque dolorem maiores assumenda dolorem facilis. Velit vel in a rerum natus facere. Enim rerum eaque qui facilis. Numquam laudantium sed id dolores omnis in. Eos reiciendis deserunt maiores et accusamus quod dolor.",
  },
  {
    id: 2,
    author: "Velit placeat sit ducimus non sed",
    title: "Discussion title 2",
    time: "1d ago",
    dateTime: "2021-01-27T16:35",
    body: "Doloremque dolorem maiores assumenda dolorem facilis. Velit vel in a rerum natus facere. Enim rerum eaque qui facilis. Numquam laudantium sed id dolores omnis in. Eos reiciendis deserunt maiores et accusamus quod dolor.",
    preview:
      "Doloremque dolorem maiores assumenda dolorem facilis. Velit vel in a rerum natus facere. Enim rerum eaque qui facilis. Numquam laudantium sed id dolores omnis in. Eos reiciendis deserunt maiores et accusamus quod dolor.",
  },
];

export default defineComponent({
  setup() {
    return {
      discussions,
      selectedDiscussion: discussions[0],
    };
  },
  data() {
    return {
      previewIsOpen: false,
    };
  },
  props: {
    channelId: {
      type: String,
      required: true,
    },
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
      :discussion="discussion"
      :channelId="channelId"
      @openDiscussionPreview="openPreview"
    />
    <DiscussionPreview
      :isOpen="previewIsOpen"
      :discussion="selectedDiscussion"
      :channelId="channelId"
      @closePreview="closePreview"
    />
  </ul>
</template>
