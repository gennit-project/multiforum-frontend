<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import ChannelDiscussionList from "./ChannelDiscussionList.vue";
import SitewideDiscussionList from "./SitewideDiscussionList.vue";
import DiscussionPreview from "./DiscussionPreview.vue";
import { useRoute, useRouter } from "vue-router";
import TagPicker from "@/components/tag/TagPicker.vue";
import ChannelPicker from "../channel/ChannelPicker.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import SearchBar from "@/components/generic/SearchBar.vue";
import TagIcon from "@/components/icons/TagIcon.vue";
import FilterChip from "@/components/generic/FilterChip.vue";
import CreateButton from "@/components/generic/CreateButton.vue";
import TwoSeparatelyScrollingPanes from "../generic/TwoSeparatelyScrollingPanes.vue";
import PrimaryButton from "../generic/PrimaryButton.vue";
import RequireAuth from "../auth/RequireAuth.vue";
import { getTagLabel, getChannelLabel } from "@/components/utils";
import { compareDate } from "@/dateTimeUtils";
import { useDisplay } from "vuetify";

interface Ref<T> {
  value: T;
}

export default defineComponent({
  components: {
    ChannelDiscussionList,
    ChannelIcon,
    ChannelPicker,
    CreateButton,
    DiscussionPreview,
    
    FilterChip,
    PrimaryButton,
    RequireAuth,
    SearchBar,
    SitewideDiscussionList,
    TagPicker,
    TagIcon,
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

    const defaultSelectedChannels = computed(() => {
      if (typeof route.params.channelId === "string") {
        return [route.params.channelId];
      }
      return [];
    });

    const selectedFilterOptions: Ref<string> = ref("");
    const selectedTags: Ref<Array<string>> = ref(
      route.params.tag && typeof route.params.tag === "string"
        ? [route.params.tag]
        : []
    );

    const selectedChannels = ref(defaultSelectedChannels.value);
    const searchInput: Ref<string> = ref("");

    const setSearchInput = (input: string) => {
      searchInput.value = input;
    };
    const setSelectedTags = (tag: Array<string>) => {
      selectedTags.value = tag;
    };

    const discussionWhere = computed(() => {
      return {
        Tags: {
          OR: selectedTags.value.map((tag: string) => {
            return { text: tag };
          }),
        },
        Channels: {
          OR: selectedChannels.value.map((channel: string) => {
            return { uniqueName: channel };
          }),
        },
        OR: [
          {
            title_CONTAINS: searchInput.value,
          },
          {
            body_CONTAINS: searchInput.value,
          },
        ],
      };
    });

    const defaultLabels = {
      channels: "Channels",
      tags: "Tags",
    };

    const channelLabel = computed(() => {
      return getChannelLabel(selectedChannels.value);
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
      lgAndDown,
      lgAndUp,
      mdAndDown,
      previewIsOpen,
      router,
      searchInput,
      setSearchInput,
      setSelectedTags,
      selectedChannels,
      selectedFilterOptions,
      selectedTags,
      tagLabel,
    };
  },

  methods: {
    updateSearchResult(input: string) {
      this.setSearchInput(input);
    },
    filterByTag(tag: string) {
      const alreadySelected = this.selectedTags.includes(tag);

      if (alreadySelected) {
        this.selectedTags = this.selectedTags.filter((t: string) => t !== tag);
      } else {
        this.selectedTags.push(tag);
      }
    },
    filterByChannel(channel: string) {
      const alreadySelected = this.selectedChannels.includes(channel);

      if (alreadySelected) {
        this.selectedChannels = this.selectedChannels.filter(
          (c: string) => c !== channel
        );
      } else {
        this.selectedChannels.push(channel);
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
});
</script>

<template>
  <div :class="[lgAndUp ? 'px-8' : 'px-4']">
    <div class="flex justify-center">
      <div>
        <div class="rounded pr-8">
          <div class="py-2">
            <div class="items-center">
              <div class="flex items-center inline-flex">
                <SearchBar
                  class="flex mr-2 align-middle"
                  :small="true"
                  :search-placeholder="'Search discussions'"
                  @updateSearchInput="updateSearchResult"
                />
                <FilterChip
                  class="align-middle mr-2"
                  v-if="!channelId"
                  :label="channelLabel"
                  :highlighted="channelLabel !== defaultLabels.channels"
                >
                  <template v-slot:icon>
                    <ChannelIcon class="-ml-0.5 w-4 h-4 mr-2" />
                  </template>
                  <template v-slot:content>
                    <ChannelPicker
                      :selected-channels="selectedChannels"
                      @setSelectedChannels="setSelectedChannels"
                    />
                  </template>
                </FilterChip>

                <FilterChip
                  class="align-middle"
                  :label="tagLabel"
                  :highlighted="tagLabel !== defaultLabels.tags"
                >
                  <template v-slot:icon>
                    <TagIcon class="-ml-0.5 w-4 h-4 mr-2" />
                  </template>
                  <template v-slot:content>
                    <TagPicker
                      :selected-tags="selectedTags.value"
                      @setSelectedTags="setSelectedTags"
                    />
                  </template>
                </FilterChip>
              </div>
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
          <TwoSeparatelyScrollingPanes
          >
            <template v-slot:leftpane>
              <SitewideDiscussionList
                v-if="!channelId"
                :discussion-where="discussionWhere"
                :search-input="searchInput"
                :selected-tags="selectedTags"
                :selected-channels="selectedChannels"
                @filterByTag="filterByTag"
                @filterByChannel="filterByChannel"
                @openPreview="openPreview"
              />
              <ChannelDiscussionList
                v-else
                :channel-id="channelId"
                :discussion-where="discussionWhere"
                :search-input="searchInput"
                :selected-tags="selectedTags"
                :selected-channels="selectedChannels"
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
