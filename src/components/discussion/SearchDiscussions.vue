<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { gql } from "@apollo/client/core";
import { useQuery } from "@vue/apollo-composable";
import DiscussionList from "./DiscussionList.vue";
import { useRoute } from "vue-router";
import ActiveFilters from "@/components/forms/ActiveFilters.vue";
import FilterModal from "@/components/forms/FilterModal.vue";
import ChannelPicker from "@/components/forms/ChannelPicker.vue";
import TagPicker from "@/components/forms/TagPicker.vue";
import { CommunityData } from "@/types/communityTypes";
import { TagData } from "@/types/tagTypes";

interface Ref<T> {
  value: T
}

export default defineComponent({
  setup() {
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId;
    });

    const showModal: Ref<boolean | undefined> = ref(false);
    const selectedFilterOptions: Ref<string> = ref("");
    const selectedTags: Ref<Array<string>> = ref([]);
    const selectedChannels: Ref<Array<string>> = ref([]);
    const searchInput: String = "";
    const communityOptions: Array<CommunityData> = [];
    const tagOptions: Array<TagData> = [];

    let textFilters = computed((): string => {
      if (!searchInput) {
        return "";
      }
      // These filters allow the
      // GET_DISCUSSIONS GraphQL query to be parameterized.
      let textFilterString = `(filter: { title: { alloftext: "${searchInput}"}, or: { body: { alloftext: "${searchInput}"}}})`;
      return textFilterString;
    });

    let needsCascade = computed(() => {
      return selectedChannels.value.length > 0 || selectedTags.value.length > 0;
    });

    let cascadeText = computed(() => {
      // Adding parameters to @cascade makes it so that
      // even when we are filtering by
      // communities or tags, we can still see the discussions that
      // don't have all the fields that we want. Normally,
      // @cascade would filter
      // out all items that don't have all of the described
      // output fields.
      // If we are filtering by community but not by tag,
      // we include only the community field in the cascade parameters.
      // If the tags parameter was included, discussions in the
      // selected community wouldn't be
      // shown just because they don't have tags.
      return `@cascade(fields: [${
        selectedTags.value.length > 0 ? `"Tags",` : ""
      } "Communities"])`;
    });

    let communityFilter = computed(() => {
      return `(filter: { url: { anyofterms: "${selectedChannels.value.join(
        " "
      )}"}})`;
    });
    let tagFilter = computed(() => {
      return `(filter: { text: { anyofterms: "${selectedTags.value.join(" ")}" }})`;
    });
    const setTagFilters = (tags: Array<string>) => {
      selectedTags.value = tags;
    }
    const setChannelFilters = (channels: Array<string>) => {
      selectedChannels.value = channels;
    }

    let discussionQuery = computed(() => {
      return gql`
        query getDiscussions {
          queryDiscussion ${textFilters.value} ${needsCascade.value ? cascadeText.value : ""}{
            id
            Communities ${
              selectedChannels.value.length > 0 ? communityFilter.value : ""
            }{
              url
            }
            title
            body
            createdDate
            Author {
              username
            }
            Tags ${selectedTags.value.length > 0 ? tagFilter.value : ""}{
              text
            }
            CommunitiesAggregate {
              count
            }
            CommentSections {
              id
              CommentsAggregate {
                count
              }
              Discussion {
                id
              }
              Event {
                id
              }
              Community {
                url
              }
            }
          }
        }
        `;
    });

    const { result, loading } = useQuery(discussionQuery.value)

    const openModal = (selectedFilter: string) => {
      showModal.value = true;
      selectedFilterOptions.value = selectedFilter;
    }
    const closeModal = () => {
      showModal.value = false;
      selectedFilterOptions.value = "";
    }
    
    const pickChannel = (channels: Array<string>) => {
      selectedChannels.value = channels;
    }
    const pickTag = (tags: Array<string>) =>{
      selectedTags.value = tags;
    }

    return {
      channelId,
      showModal,
      selectedFilterOptions,
      result,
      loading,
      selectedChannels,
      selectedTags,
      communityOptions,
      tagOptions,
      openModal,
      closeModal,
      pickChannel,
      pickTag,
      setTagFilters,
      setChannelFilters
    };
  },
  components: {
    DiscussionList,
    ActiveFilters,
    FilterModal,
    ChannelPicker,
    TagPicker,
  }
});
</script>

<template>
  <div>
    <ActiveFilters
      :class="['mx-auto', 'max-w-5xl']"
      :search-placeholder="'Search discussions'"
      :applicable-filters="channelId ? ['tags'] : ['channels', 'tags']"
      :selected-tags="selectedTags"
      :selected-channels="selectedChannels"
      :channel-id="channelId"
      @openModal="openModal"
    />
    <div v-if="loading">Loading...</div>
    <DiscussionList 
      v-else-if="result && result.queryDiscussion"
      :discussions="result.queryDiscussion" 
      :channel-id="channelId" />
    <FilterModal :show="showModal" @closeModal="closeModal">
      <ChannelPicker 
        v-if="selectedFilterOptions === 'channelPicker'"
        :community-options="communityOptions"
        :selected-channels="selectedChannels"
        @pickChannel="pickChannel"
        @setChannelFilters="setChannelFilters"
      />
      <TagPicker
        v-if="selectedFilterOptions === 'tagPicker'"
        :tag-options="tagOptions"
        :selected-tags="selectedTags"
        @pickTag="pickTag"
        @setTagFilters="setTagFilters"
      />
    </FilterModal>
  </div>
</template>
