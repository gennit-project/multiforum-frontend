<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import ChannelDiscussionList from "./ChannelDiscussionList.vue";
import SitewideDiscussionList from "./SitewideDiscussionList.vue";
import DiscussionPreview from "./DiscussionPreview.vue";
import { useRoute, useRouter } from "vue-router";
import CreateButton from "@/components/generic/CreateButton.vue";
import TwoSeparatelyScrollingPanes from "../../generic/TwoSeparatelyScrollingPanes.vue";
import PrimaryButton from "../../generic/PrimaryButton.vue";
import RequireAuth from "../../auth/RequireAuth.vue";
import { getTagLabel, getChannelLabel } from "@/components/utils";
import { compareDate } from "@/dateTimeUtils";
import { useDisplay } from "vuetify";
import getDiscussionWhere from "@/components/discussion/list/getDiscussionWhere";
import { SearchDiscussionValues } from "@/types/discussionTypes";
import DiscussionFilterBar from "@/components/discussion/list/DiscussionFilterBar.vue";
import { getFilterValuesFromParams } from "@/components/event/list/getFilterValuesFromParams";

interface Ref<T> {
  value: T;
}

export default defineComponent({
  components: {
    ChannelDiscussionList,
    CreateButton,
    DiscussionFilterBar,
    DiscussionPreview,
    PrimaryButton,
    RequireAuth,
    SitewideDiscussionList,
    TwoSeparatelyScrollingPanes,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    const discussionId = computed(() => {
      if (typeof route.params.discussionId === "string") {
        return route.params.discussionId;
      }
      return "";
    });

    const filterValues: Ref<SearchDiscussionValues> = ref(getFilterValuesFromParams(route, channelId.value));

    const selectedTags: Ref<Array<string>> = ref(
      route.params.tag && typeof route.params.tag === "string"
        ? [route.params.tag]
        : []
    );

    const setSelectedTags = (tag: Array<string>) => {
      selectedTags.value = tag;
    };

    const discussionWhere = computed(() => {
      return getDiscussionWhere(filterValues.value, channelId.value);
    });

    const defaultLabels = {
      channels: "Channels",
      tags: "Tags",
    };

    const channelLabel = computed(() => {
      return getChannelLabel(filterValues.value.channels);
    });

    const tagLabel = computed(() => {
      return getTagLabel(selectedTags.value);
    });

    const createDiscussionPath = channelId.value
      ? `/channels/c/${channelId.value}/discussions/create`
      : "/discussions/create";

    const previewIsOpen = ref(false);

    const { lgAndDown, lgAndUp, mdAndDown } = useDisplay();

    return {
      channelId,
      channelLabel,
      compareDate,
      createDiscussionPath,
      defaultLabels,
      discussionId,
      discussionWhere,
      filterValues,
      lgAndDown,
      lgAndUp,
      mdAndDown,
      previewIsOpen,
      route,
      router,
      setSelectedTags,
      selectedTags,
      tagLabel,
    };
  },
  methods: {
    updateFilters(params: SearchDiscussionValues) {
      const existingQuery = this.$route.query;
      // Updating the URL params causes the events
      // to be refetched by the EventListView
      // and MapView components
      this.$router.replace({
        query: {
          ...existingQuery,
          ...params,
        },
      });
    },
    filterByTag(tag: string) {
      const alreadySelected = this.filterValues.tags.includes(tag);

      if (alreadySelected) {
        this.filterValues.tags = this.filterValues.tags.filter(
          (t: string) => t !== tag
        );
      } else {
        this.filterValues.tags.push(tag);
      }
      this.updateFilters({ tags: tag });
    },
    filterByChannel(channel: string) {
      const alreadySelected = this.filterValues.channels.includes(channel);

      if (alreadySelected) {
        this.filterValues.channels = this.filterValues.channels.filter(
          (c: string) => c !== channel
        );
      } else {
        this.filterValues.channels.push(channel);
      }
      this.updateFilters({ channels: channel });
    },
    closePreview() {
      this.previewIsOpen = false;
    },
    openPreview() {
      this.previewIsOpen = true;
    },
    setSelectedChannels(channels: Array<string>) {
      this.selectedChannels = channels;
    },
  },
  created() {
    this.$watch("$route.query", () => {
      if (this.$route.query) {
        this.filterValues = getFilterValuesFromParams(
          this.route,
          this.channelId
        );
      }
    });
    
  },
});
</script>

<template>
  <div :class="[lgAndUp ? 'px-8' : 'px-4']">
    <div class="flex justify-center">
      <div>
        <div class="rounded pr-8">
          <div class="py-2">
            <div class="items-center">
              <DiscussionFilterBar />
              <RequireAuth class="flex inline-flex">
                <template v-slot:has-auth>
                  <CreateButton
                    class="align-middle ml-2"
                    :to="createDiscussionPath"
                    :label="'Create Discussion'"
                  />
                </template>
                <template v-slot:does-not-have-auth>
                  <PrimaryButton
                    class="align-middle ml-2"
                    :label="'Create Discussion'"
                  />
                </template>
              </RequireAuth>
            </div>
          </div>
        </div>
        <div>
          <TwoSeparatelyScrollingPanes>
            <template v-slot:leftpane>
              <SitewideDiscussionList
                v-if="!channelId"
                :discussion-where="discussionWhere"
                :search-input="filterValues.searchInput"
                :selected-tags="filterValues.tags"
                :selected-channels="filterValues.channels"
                @filterByTag="filterByTag"
                @filterByChannel="filterByChannel"
                @openPreview="openPreview"
              />
              <ChannelDiscussionList
                v-else
                :channel-id="channelId"
                :discussion-where="discussionWhere"
                :search-input="filterValues.searchInput"
                :selected-tags="filterValues.tags"
                :selected-channels="filterValues.channels"
                @filterByTag="filterByTag"
                @filterByChannel="filterByChannel"
                @openPreview="openPreview"
              />
              <DiscussionPreview
                v-if="mdAndDown"
                :isOpen="previewIsOpen"
                @closePreview="closePreview"
              />
            </template>
            <template v-slot:rightpane>
              <router-view></router-view>
            </template>
          </TwoSeparatelyScrollingPanes>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.height-constrained {
  max-height: 50px;
}
.min-w-lg {
  min-width: 1300px;
}
</style>
