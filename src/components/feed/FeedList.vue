<script lang="ts">
import { defineComponent } from "vue";
import FeedPreview from "./FeedPreview.vue";
import FeedListItem from "./FeedListItem.vue";
import { FeedData } from "../../types/feedTypes";


const feeds = [
  {
    id: 1,
    channelId: "cats",
    author: "Velit placeat sit ducimus non sed",
    title: "Feed title 1",
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
    title: "Feed title 2",
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
      feeds,
      selectedFeed: feeds[0],
    };
  },
  data() {
    return {
      previewIsOpen: false,
    };
  },
  components: {
    FeedPreview,
    FeedListItem,
  },
  methods: {
    openPreview(data: FeedData) {
      this.previewIsOpen = true;
      this.selectedFeed = data;
    },
    closePreview() {
      this.previewIsOpen = false;
    },
  },
});
</script>
<template>
  <ul role="list" class="divide-y divide-gray-200">
    <FeedListItem
      v-for="feed in feeds"
      :key="feed.id"
      :channel-id="feed.channelId"
      :feed="feed"
      @openFeedPreview="openPreview"
    />
    <FeedPreview
      :isOpen="previewIsOpen"
      :feed="selectedFeed"
      @closePreview="closePreview"
    />
  </ul>
</template>
