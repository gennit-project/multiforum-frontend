<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import ChannelList from "./ChannelList.vue";
import { gql } from "@apollo/client/core";
import { GET_TAGS } from "@/graphQLData/tag/queries";
import { TagData } from "@/types/tagTypes.d";
import { ChannelData } from "@/types/channelTypes.d";
import SearchBar from "@/components/forms/SearchBar.vue";
import TagIcon from "@/components/icons/TagIcon.vue";
import FilterChip from "@/components/forms/FilterChip.vue";
import TagPicker from "@/components/forms/TagPicker.vue";
import CreateButton from "@/components/buttons/CreateButton.vue";
import LoadMore from "../buttons/LoadMore.vue";
import { getTagLabel } from "@/components/forms/utils";
import { useRoute } from "vue-router";

interface Ref<T> {
  value: T;
}

export default defineComponent({
  components: {
    ChannelList,
    CreateButton,
    FilterChip,
    LoadMore,
    TagPicker,
    SearchBar,
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
      query getChannels($channelWhere: ChannelWhere, $eventWhere: EventWhere) {
        channels(where: $channelWhere) {
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
    });

    if (error.value) {
      alert(JSON.stringify(error.value));
    }

    const reachedEndOfResults = ref(false);

    const loadMore = () => {
      fetchMore({
        updateQuery: (prev, { fetchMoreResult }) => {
          if (fetchMoreResult.queryChannel.length === 0) {
            reachedEndOfResults.value = true;
            return prev;
          }
          return {
            ...prev,
            queryChannel: [
              ...prev.queryChannel,
              ...fetchMoreResult.queryChannel,
            ],
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
  <div>
    <div>
      <div class="mx-auto max-w-5xl items-center flex mt-1 space-x-2 px-8">
        <SearchBar
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
        <CreateButton :to="createChannelPath" :label="'Create Channel'" />
      </div>
    </div>
    <div class="bg-gray-100 pt-1">
      <div class="px-8 flex-1  mx-auto max-w-5xl" v-if="channelLoading">Loading...</div>
      <ChannelList
        class="px-8 flex-1 text-xl font-bold mx-auto max-w-5xl"
        v-else-if="channelResult && channelResult.channels"
        :channels="channelResult.channels"
        :search-input="searchInput"
        :selected-tags="selectedTags"
        @filterByTag="filterByTag"
      />
      <div class="grid justify-items-stretch m-10">
        <LoadMore
          class="justify-self-center"
          :reached-end-of-results="reachedEndOfResults"
          @loadMore="loadMore"
        />
      </div>
    </div>
  </div>
</template>