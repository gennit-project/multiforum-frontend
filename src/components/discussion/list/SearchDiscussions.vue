<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import ChannelDiscussionList from "./ChannelDiscussionList.vue";
import SitewideDiscussionList from "./SitewideDiscussionList.vue";
import DrawerFlyout from "../../generic/DrawerFlyout.vue";
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
import { getFilterValuesFromParams } from "@/components/event/list/filters/getFilterValuesFromParams";
import DiscussionDetail from "../detail/DiscussionDetail.vue";

interface Ref<T> {
  value: T;
}

export default defineComponent({
  components: {
    ChannelDiscussionList,
    CreateButton,
    DiscussionDetail,
    DiscussionFilterBar,
    DrawerFlyout,
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

    const filterValues: Ref<SearchDiscussionValues> = ref(
      getFilterValuesFromParams(route, channelId.value)
    );

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
    handleClickTag(tagText: string){
      const currentQuery = this.$route.query;

      if (currentQuery.tags){
        if (typeof currentQuery.tags === 'string' && tagText === currentQuery.tags) {
          // If we're already filtering by the tag, clear it.
          const newQuery = {...this.$route.query};
          delete newQuery['tags']

          this.$router.replace({
            query: {
              ...newQuery
            }
          })

          this.filterValues.tags = this.filterValues.tags.filter(
          (t: string) => t !== tagText
        );
        } else if (typeof currentQuery.tags === 'object' && currentQuery.tags.includes(tagText)){
          // If we're already filtering by multiple tags including this tag,
          // remove only this tag.
          const newQuery = {...this.$route.query};
          newQuery.tags = newQuery.tags.filter((tag: string) => {
            return tag !== tagText;
          })

          this.$router.replace({
            query: {
              ...newQuery
            }
          })
          this.filterValues.tags.push(tagText);
        } else {
          // If we are not already filtering by the tag,
          // overwrite existing tag filters with it.
          this.updateFilters({ tags: [tagText] })
        }
      } else {
        this.updateFilters({ tags: [tagText] })
      }
    },
    handleClickChannel(uniqueName: string ){
      const currentQuery = this.$route.query;

      if (currentQuery.channels){
        if (typeof currentQuery.channels === 'string' && uniqueName === currentQuery.channels) {
          // If we're already filtering by the channel, clear it.
          const newQuery = {...this.$route.query};
          delete newQuery['channels']

          this.$router.replace({
            query: {
              ...newQuery
            }
          })

          this.filterValues.channels = this.filterValues.channels.filter(
          (c: string) => c !== uniqueName
        );
        } else if (typeof currentQuery.channels === 'object' && currentQuery.channels.includes(uniqueName)){
          // If we're already filtering by multiple channels including this channel,
          // remove only this channel.
          const newQuery = {...this.$route.query};
          newQuery.channels = newQuery.channels.filter((channel: string) => {
            return channel !== uniqueName;
          })

          this.$router.replace({
            query: {
              ...newQuery
            }
          })
          this.filterValues.channels.push(uniqueName);
        } else {
          // If we are not already filtering by the channel,
          // overwrite existing channel filters with it.
          this.updateFilters({ channels: [uniqueName] })
        }
      } else {
        this.updateFilters({ channels: [uniqueName] })
      }
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
  <div>
    <div class="flex justify-center w-full">
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
        <div class="w-full">
          <TwoSeparatelyScrollingPanes>
            <template v-slot:leftpane>
              <SitewideDiscussionList
                v-if="!channelId"
                :search-input="filterValues.searchInput"
                :selected-tags="filterValues.tags"
                :selected-channels="filterValues.channels"
                @filterByTag="handleClickTag"
                @filterByChannel="handleClickChannel"
                @openPreview="openPreview"
              />
              <ChannelDiscussionList
                v-else
                :channel-id="channelId"
                :search-input="filterValues.searchInput"
                :selected-tags="filterValues.tags"
                :selected-channels="filterValues.channels"
                @filterByTag="handleClickTag"
                @filterByChannel="handleClickChannel"
                @openPreview="openPreview"
              />
              <DrawerFlyout
                v-if="mdAndDown"
                :isOpen="previewIsOpen"
                @closePreview="closePreview"
              >
                <DiscussionDetail />
              </DrawerFlyout>
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
