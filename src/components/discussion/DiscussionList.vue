<script lang="ts">
import { defineComponent, computed } from "vue";
import DiscussionPreview from "./DiscussionPreview.vue";
import DiscussionListItem from "./DiscussionListItem.vue";
import { DiscussionData } from "../../types/discussionTypes";
import { useRoute } from "vue-router";


const discussions = [
  {
    id: 1,
    channelId: "cats",
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
    channelId: "cats",
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
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId || "";
    });
    return {
      discussions,
      channelId,
      selectedDiscussion: discussions[0],
    };
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
