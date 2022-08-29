<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { gql } from "@apollo/client/core";
import { useQuery } from "@vue/apollo-composable";
import EventList from "./EventList.vue";
import ToggleMap from "../buttons/ToggleMap.vue";
import CreateButton from "@/components/buttons/CreateButton.vue";
import { router } from "@/router";
import { useRoute } from "vue-router";
import { DateTime } from 'luxon';
import {
  EventData,
} from "@/types/eventTypes";
import {
  defaultSelectedHourRanges,
} from "@/components/event/eventSearchOptions";
import { chronologicalOrder } from "./filterStrings";
import { SearchEventValues } from "@/types/eventTypes";

export default defineComponent({
  name: "SearchEvents",
  components: {
    CreateButton,
    EventList,
    ToggleMap,
  },
  setup() {
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId;
    });

    const now = DateTime.now();
    const nowISO = now.toISO();
    const futureEventsFilter = `{ startTime_GT: "${nowISO}" },`;

    const defaultEventFilterString =  `(
      options: {
        sort: ${chronologicalOrder}
      }
      where: {
        AND: [
          { canceled: false },
          {
            ChannelsAggregate: {
                count_GT: 0
            }
          },
          ${futureEventsFilter}
        ]
      }
    ) `;

    const eventFilterString = ref(defaultEventFilterString)

    let eventQueryString = computed(() => {
      let str = `
        query {
          events ${eventFilterString.value}{
            id
            Channels {
              uniqueName
            }
            title
            description
            startTime
            endTime
            locationName
            address
            virtualEventUrl
            location {
              latitude
              longitude
            }
            cost
            Poster {
              username
            }
            Tags {
              text
            }
            CommentSections {
              id
              CommentsAggregate {
                count
              }
              OriginalPost {
                __typename
                ... on Discussion {
                  id
                  title
                }
                ... on Event {
                  id
                  title
                }
              }
              Channel {
                uniqueName
              }
            }
          }
        }`;
      return str;
    });

    // Turn the query string into an actual GraphQL
    // query. Any GraphQL syntax errors will be thrown here.
    let eventQuery = computed(() => {
      try {
        return gql`
          ${eventQueryString.value}
        `;
      } catch (err) {
        throw new Error(`Invalid query string: ${eventQueryString.value}`);
      }
    });

    const {
      result: eventResult,
      loading: eventLoading,
      refetch: refetchEvents,
      fetchMore,
    } = useQuery(eventQuery, { first: 20, offset: 0 });

    const reachedEndOfResults = ref(false);

    const loadMore = () => {
      fetchMore({
        variables: {
          offset: eventResult.value.events.length,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (fetchMoreResult.events.length === 0) {
            reachedEndOfResults.value = true;
            return prev;
          }
          return {
            ...prev,
            events: [...prev.events, ...fetchMoreResult.events],
          };
        },
      });
    };

    const createEventPath = channelId.value
      ? `/channels/c/${channelId.value}/events/create`
      : "/events/create";

    return {
      channelId,
      createEventPath,
      defaultSelectedHourRanges,
      eventFilterString,
      eventLoading,
      eventQuery,
      eventQueryString,
      eventResult,
      loadMore,
      reachedEndOfResults,
      refetchEvents,
      router,
      placeData: null,
      showMap: ref(false)
    };
  },
  data() {
    return {
      eventPreviewIsOpen: false,
      multipleEventPreviewIsOpen: false,
      selectedEvent: null as EventData | null,
      selectedEvents: [],
      highlightedEventLocationId: "",
      highlightedEventId: "",
      highlightedMarker: null,
      colorLocked: false,
      markerMap: {} as any,
      map: {} as any,
    };
  },
  methods: {
    updateSearchResult(input: string) {
      this.setSearchInput(input);
    },
    filterByTag(tag: string) {
      this.setSelectedTags([tag]);
    },
    setShowMap() {
      this.showMap = true;
      const path = this.channelId
        ? `/channels/c/${this.channelId}/events`
        : "events";
      router.push({
        path,
        query: {
          search: this.searchInput.value,
          channel: this.selectedChannels.value,
          tag: this.selectedTags.value,
          view: "map",
        },
      });
    },
    setShowList() {
      this.showMap = false;
      const path = this.channelId
        ? `/channels/${this.channelId}/events`
        : "events";
      router.push({
        path,
        query: {
          search: this.searchInput.value,
          channel: this.selectedChannels.value,
          tag: this.selectedTags.value,
          view: "list",
        },
      });
    },
    updateEventFilterString(data: SearchEventValues) {
      const existingValues = this.formValues;

      this.formValues = {
        ...existingValues,
        ...data,
      };
    },
    updateRouterQueryParams(e: any) {
      router.push(e);
    }
  },
});
</script>
<template>
  <div class="mx-auto max-w-6xl bg-white rounded pl-8 pr-8">
    <div class="mt-8 mb-4 md:flex md:items-center md:justify-between">
      <div class="flex-1 min-w-0">
        <h2
          class="
            text-2xl
            font-bold
            leading-7
            text-gray-900
            sm:text-3xl sm:tracking-tight sm:truncate
          "
        >
          Search Events
        </h2>
      </div>
      <div class="mt-4 flex-shrink-0 flex md:mt-0 md:ml-4">
        <div class="float-right">
          <span class="flex-shrink-0 space-x-2 flex float-right">
            <ToggleMap
              :show-map="showMap"
              @showMap="setShowMap"
              @showList="setShowList"
            />
            <CreateButton :to="createEventPath" :label="'Create Event'" />
          </span>
        </div>
      </div>
    </div>
    <EventFilterBar :event-filter-string="eventFilterString" />
    <div v-if="eventLoading">Loading...</div>
    <ErrorBanner v-else-if="eventError" :text="eventError.message" />
    <EventList
      id="listView"
      v-else-if="!showMap && eventResult && eventResult.events"
      :class="[!channelId ? '' : '']"
      class="relative text-lg"
      :events="eventResult.events"
      :channel-id="channelId"
      :search-input="searchInput"
      :selected-tags="selectedTags"
      :selected-channels="selectedChannels"
      :show-map="showMap"
      @filterByTag="filterByTag"
    />
    <MapView v-else-if="showMap && eventResult && eventResult.events" />
  </div>
</template>

<style>
.gray {
  color: gray;
}
</style>
