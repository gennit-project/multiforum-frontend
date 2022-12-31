<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import ChannelList from "./ChannelList.vue";
import { gql } from "@apollo/client/core";
import { GET_TAGS } from "@/graphQLData/tag/queries";
import { TagData } from "@/types/tagTypes.d";
import { ChannelData } from "@/types/channelTypes.d";
import TagIcon from "@/components/icons/TagIcon.vue";
import FilterChip from "@/components/generic/FilterChip.vue";
import TagPicker from "@/components/tag/TagPicker.vue";
import CreateButton from "@/components/generic/CreateButton.vue";
import ErrorBanner from "../generic/ErrorBanner.vue";
import { getTagLabel } from "@/components/utils";
import { useRoute } from "vue-router";

interface Ref<T> {
  value: T;
}

export default defineComponent({
  components: {
    ChannelList,
    CreateButton,
    ErrorBanner,
    FilterChip,
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

    const GET_CHANNELS = gql`
      query getChannels($channelWhere: ChannelWhere, $eventWhere: EventWhere, $limit: Int, $offset: Int) {
        channelsAggregate(where: $channelWhere) {
          count
        }
        channels(where: $channelWhere, options: {
          limit: $limit,
          offset: $offset
        }) {
          uniqueName
          description
          Tags {
            text
          }
          EventsAggregate(where: $eventWhere) {
            count
          }
          DiscussionsAggregate {
            count
          }
        }
      }
    `;

    const channelWhere = computed(() => {
      return {
        Tags: {
          OR: selectedTags.value.map((tag: string) => {
            return { text: tag };
          }),
        },
        OR: [
          {
            uniqueName_CONTAINS: searchInput.value,
          },
          {
            description_CONTAINS: searchInput.value,
          },
        ],
      };
    });

    const {
      error: channelError,
      result: channelResult,
      loading: channelLoading,
      refetch: refetchChannels,
      fetchMore,
      error,
    } = useQuery(GET_CHANNELS, {
      channelWhere: channelWhere,
      eventWhere: {
        startTime_GT: new Date().toISOString(),
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
          offset: channelResult.value.channels.length
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult

          return {
            ...previousResult,
            channels: [
              ...previousResult.channels,
              ...fetchMoreResult.channels,
            ],
          }
        }
      })
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
      defaultLabels,
      links,
      loadMore,
      openModal,
      reachedEndOfResults,
      refetchChannels,
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
  <div class="bg-gray-50">
    <div class="rounded pl-8 pr-8 bg-white shadow-sm">
      <div class="mb-4 pt-8  mx-auto max-w-5xl ">
        <div class="block flex justify-center"> 

          <h1 class="px-4 lg:px-12 text-2xl block mt-6 text-black">
    
            Channels
          </h1>
        </div>
        
      </div>
    </div>
    
    <div class="pt-1">
      <div class="mt-2 flex justify-between mx-auto max-w-5xl">
        <!-- <SearchBar
          class="flex"
          :search-placeholder="'Search channels'"
          @updateSearchInput="updateSearchResult"
        /> -->
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
          <CreateButton :to="createChannelPath" :label="'Create Channel'" />
  
      </div>
      <ErrorBanner class="mx-auto max-w-5xl" v-if="channelError" :text="channelError.message" />
      <ChannelList
        class="flex-1 text-xl font-bold mx-auto max-w-5xl"
        v-if="channelResult && channelResult.channels"
        :channels="channelResult.channels"
        :result-count="channelResult.channelsAggregate.count"
        :search-input="searchInput.value"
        :selected-tags="selectedTags.value"
        @filterByTag="filterByTag"
        @loadMore="loadMore"
      />
      <div class="flex-1 mx-auto max-w-5xl" v-if="channelLoading">
        Loading...
      </div>
    </div>
  </div>
</template>