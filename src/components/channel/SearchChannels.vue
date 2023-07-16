<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import ChannelList from "./ChannelList.vue";
import { GET_CHANNELS } from "@/graphQLData/channel/queries";
import { GET_TAGS } from "@/graphQLData/tag/queries";
import { TagData } from "@/types/tagTypes.d";
import { ChannelData } from "@/types/channelTypes.d";
import TagIcon from "@/components/icons/TagIcon.vue";
import FilterChip from "@/components/generic/FilterChip.vue";
import TagPicker from "@/components/tag/TagPicker.vue";
import CreateButton from "@/components/generic/CreateButton.vue";
import ErrorBanner from "../generic/ErrorBanner.vue";
import PrimaryButton from "../generic/PrimaryButton.vue";
import RequireAuth from "@/components/auth/RequireAuth.vue";
import { getTagLabel } from "@/components/utils";
import { useRoute } from "vue-router";
import SearchBar from "../generic/SearchBar.vue";

interface Ref<T> {
  value: T;
}

export default defineComponent({
  components: {
    ChannelList,
    CreateButton,
    ErrorBanner,
    FilterChip,
    PrimaryButton,
    RequireAuth,
    SearchBar,
    TagPicker,
    TagIcon,
  },
  setup() {
    const route = useRoute();
    const links = computed(() => {
      return [
        {
          label: "Channels",
          path: "channels",
        },
      ];
    });

    const showModal: Ref<boolean | undefined> = ref(false);
    const selectedFilterOptions: Ref<string> = ref("");

    const selectedTags: Ref<Array<string>> = ref(
      route.params.tag && typeof route.params.tag === "string"
        ? [route.params.tag]
        : []
    );
    const searchInput: Ref<string> = ref("");

    const setSearchInput = (input: string) => {
      searchInput.value = input;
    };
    const setSelectedTags = (tag: Array<string>) => {
      selectedTags.value = tag;
    };

    const channelWhere = computed(() => {
      const tagSearch = {
        Tags: {
          OR: selectedTags.value.map((tag: string) => {
            return { text_MATCHES: `(?i)${tag}` };
          }),
        },
      };

      const textSearch = {
        OR: [
          {
            uniqueName_CONTAINS: searchInput.value,
          },
          {
            description_CONTAINS: searchInput.value,
          },
        ],
      };

      return {
        AND: [tagSearch, textSearch],
      };
    });

    const {
      error: channelError,
      result: channelResult,
      loading: channelLoading,
      fetchMore,
      error,
    } = useQuery(GET_CHANNELS, {
      channelWhere: channelWhere,
      eventChannelWhere: {
        Event: {
          startTime_GT: new Date().toISOString(),
        },
      },
      limit: 25,
      offset: 0,
    });

    if (error.value) {
      alert(JSON.stringify(error.value));
    }

    const reachedEndOfResults = ref(false);

    const loadMore = () => {
      fetchMore({
        variables: {
          offset: channelResult.value.channels.length,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult;

          return {
            ...previousResult,
            channels: [...previousResult.channels, ...fetchMoreResult.channels],
          };
        },
      });
    };

    const { result: tagOptions } = useQuery(GET_TAGS);

    const openModal = (selectedFilter: string) => {
      showModal.value = true;
      selectedFilterOptions.value = selectedFilter;
    };
    const closeModal = () => {
      showModal.value = false;
      selectedFilterOptions.value = "";
    };

    const defaultLabels = {
      tags: "Tags",
    };

    const tagLabel = computed(() => {
      return getTagLabel(selectedTags.value);
    });

    return {
      closeModal,
      channelError,
      channelLoading,
      channelResult,
      channelWhere,
      defaultLabels,
      links,
      loadMore,
      openModal,
      reachedEndOfResults,
      searchInput,
      setSearchInput,
      setSelectedTags,
      showModal,
      selectedFilterOptions,
      selectedTags,
      tagLabel,
      tagOptions,
    };
  },
  data() {
    return {
      queryChannel: [],
      createChannelPath: "/channels/create",
    };
  },
  methods: {
    getTagOptionLabels(options: Array<TagData>) {
      return options.map((tag) => tag.text);
    },
    getChannelOptionLabels(options: Array<ChannelData>) {
      return options.map((channel) => channel.uniqueName);
    },
    updateSearchResult(input: string) {
      this.setSearchInput(input);
    },
    filterByTag(tag: string) {
      this.setSelectedTags([tag]);
    },
  },
});
</script>

<template>
  <div >
    <div class="px-4">
      <div class="pt-2 flex justify-between mx-auto max-w-5xl">
        <div class="flex inline-flex py-2 w-full">
          <SearchBar
            class="align-middle mr-2"
            :search-placeholder="'Search channels'"
            @updateSearchInput="updateSearchResult"
          />
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
                :selected-tags="selectedTags"
                @setSelectedTags="setSelectedTags"
              />
            </template>
          </FilterChip>
        </div>

        <RequireAuth>
          <template v-slot:has-auth>
            <CreateButton :to="createChannelPath" :label="'Create Channel'" />
          </template>
          <template v-slot:does-not-have-auth>
            <PrimaryButton :label="'Create Channel'" />
          </template>
        </RequireAuth>
      </div>
      <ErrorBanner
        class="mx-auto max-w-5xl"
        v-if="channelError"
        :text="channelError.message"
      />
      <ChannelList
        class="flex-1 text-xl font-bold mx-auto max-w-5xl"
        v-if="channelResult && channelResult.channels"
        :channels="channelResult.channels"
        :result-count="channelResult.channelsAggregate?.count || 0"
        :search-input="searchInput"
        :selected-tags="selectedTags"
        @filterByTag="filterByTag"
        @loadMore="loadMore"
      />
      <div class="flex-1 mx-auto max-w-5xl" v-if="channelLoading">
        Loading...
      </div>
    </div>
  </div>
</template>
