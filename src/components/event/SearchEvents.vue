<script lang="ts">
import { defineComponent, computed, PropType, ref } from "vue";

import { gql } from "@apollo/client/core";
import { useQuery } from "@vue/apollo-composable";
import { GET_COMMUNITY_NAMES } from "@/graphQLData/community/queries";
import { GET_TAGS } from "@/graphQLData/tag/queries";

import AddToFeed from "../buttons/AddToFeed.vue";
import ChannelPicker from "@/components/forms/ChannelPicker.vue";
import EventList from "./EventList.vue";
import EventPreview from "./EventPreview.vue";
import LocationIcon from "../icons/LocationIcon.vue";
import LocationSearchBar from "@/components/forms/LocationSearchBar.vue";
import Map from "./Map.vue";
import PreviewContainer from "./PreviewContainer.vue";
import TagPicker from "@/components/forms/TagPicker.vue";
import ToggleMap from "../buttons/ToggleMap.vue";
import SearchBar from "../forms/SearchBar.vue";
import WeeklyTimePicker from "@/components/forms/WeeklyTimePicker.vue";
import FilterChip from "@/components/forms/FilterChip.vue";
import FilterIcon from "../icons/FilterIcon.vue";
import CalendarIcon from "../icons/CalendarIcon.vue";
import ChannelIcon from "../icons/ChannelIcon.vue";
import TagIcon from "../icons/TagIcon.vue";
import TimeIcon from "../icons/TimeIcon.vue";
import CloseButton from "@/components/buttons/CloseButton.vue";

import { router } from "@/router";
import { useRoute } from "vue-router";

import { EventData } from "../../types/eventTypes";
import { TagData } from "@/types/tagTypes.d";
import { ChannelData } from "@/types/channelTypes.d";

interface Ref<T> {
  value: T;
}

export default defineComponent({
  name: "SearchEvents",
  components: {
    AddToFeed,
    CalendarIcon,
    ChannelIcon,
    ChannelPicker,
    CloseButton,
    EventList,
    EventPreview,
    FilterChip,
    FilterIcon,
    LocationIcon,
    LocationSearchBar,
    Map,
    PreviewContainer,
    TagIcon,
    TagPicker,
    TimeIcon,
    ToggleMap,
    SearchBar,
    WeeklyTimePicker,
  },
  setup(props) {
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId;
    });

    const showModal: Ref<boolean | undefined> = ref(false);
    const selectedFilterOptions: Ref<string> = ref("");
    const selectedTags: Ref<Array<string>> = ref(props.routerTags);
    const selectedChannels: Ref<Array<string>> = ref(props.routerChannels);
    const searchInput: Ref<string> = ref("");

    let textFilters = computed((): string => {
      if (!searchInput.value) {
        return "";
      }
      let textFilterString = `, filter: { or: [ { title: { alloftext: "${searchInput.value}"} },{ description: { alloftext: "${searchInput.value}"} }]}`;
      return textFilterString;
    });

    let needsCascade = computed(() => {
      return selectedChannels.value.length > 0 || selectedTags.value.length > 0;
    });

    let cascadeText = computed(() => {
      // Adding parameters to @cascade makes it so that
      // even when we are filtering by
      // communities or tags, we can still see the events that
      // don't have all the fields that we want. Normally,
      // @cascade would filter
      // out all items that don't have all of the described
      // output fields.
      // If we are filtering by community but not by tag,
      // we include only the community field in the cascade parameters.
      // If the tags parameter was included, events in the
      // selected community would be excluded for not having tags.
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
      return `(filter: { text: { anyofterms: "${selectedTags.value.join(
        " "
      )}" }})`;
    });
    const updateRouterQueryParams = () => {
      router.push({
        path: "/events",
        query: {
          search: searchInput.value,
          channel: selectedChannels.value,
          tag: selectedTags.value,
        },
      });
    };

    const setSearchInput = (input: string) => {
      searchInput.value = input;
      updateRouterQueryParams();
    };
    const setLocationInput = (placeData: any) => {
      if (placeData) {
        const latitude = placeData.geometry.location.lat();
        const longitude = placeData.geometry.location.lng();
        console.log("place ", {
          latitude,
          longitude,
        });
      }
    };
    const setTagFilters = (tag: Array<string>) => {
      selectedTags.value = tag;
      updateRouterQueryParams();
    };
    const setChannelFilters = (channel: Array<string>) => {
      selectedChannels.value = channel;
      updateRouterQueryParams();
    };

    let eventQueryString = computed(() => {
      return `
        query getEvents ($first: Int, $offset: Int){
          queryEvent (offset: $offset, first: $first${textFilters.value}) ${
        needsCascade.value ? cascadeText.value : ""
      }{
            id
            Communities ${
              selectedChannels.value.length > 0 ? communityFilter.value : ""
            }{
              url
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
            Organizer {
              username
            }
            Tags ${selectedTags.value.length > 0 ? tagFilter.value : ""}{
              text
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

    let eventQuery = computed(() => {
      return gql`
        ${eventQueryString.value}
      `;
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
          offset: eventResult.value.queryEvent.length,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (fetchMoreResult.queryEvent.length === 0) {
            reachedEndOfResults.value = true;
            return prev;
          }
          return {
            ...prev,
            queryEvent: [...prev.queryEvent, ...fetchMoreResult.queryEvent],
          };
        },
      });
    };

    const { result: tagOptions } = useQuery(GET_TAGS);
    const { result: channelOptions } = useQuery(GET_COMMUNITY_NAMES);

    const openModal = (selectedFilter: string) => {
      showModal.value = true;
      selectedFilterOptions.value = selectedFilter;
    };
    const closeModal = () => {
      showModal.value = false;
      selectedFilterOptions.value = "";
    };

    const channelLabel = computed(() => {
      if (selectedChannels.value.length > 0) {
        const channelString = selectedChannels.value.join(", ");
        return `Channels: ${channelString}`;
      }
      return "Channels";
    });

    const tagLabel = computed(() => {
      if (selectedTags.value.length > 0) {
        const tagString = selectedTags.value.join(", ");
        return `Tags: ${tagString}`;
      }
      return "Tags";
    });

    return {
      channelId,
      channelLabel,
      channelOptions,
      closeModal,
      eventLoading,
      eventQuery,
      eventQueryString,
      eventResult,
      loadMore,
      openModal,
      reachedEndOfResults,
      refetchEvents,
      router,
      searchInput,
      setLocationInput,
      setSearchInput,
      setChannelFilters,
      setTagFilters,
      showModal,
      selectedChannels,
      selectedFilterOptions,
      selectedTags,
      tagLabel,
      tagOptions,
      textFilters,
    };
  },
  data(props) {
    let showMap = false;
    if (props.routerView === "map") {
      showMap = true;
    }
    return {
      showMap,
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
  props: {
    routerTags: {
      type: Array as PropType<Array<string>>,
      default: () => {
        return [];
      },
    },
    routerChannels: {
      type: Array as PropType<Array<string>>,
      default: () => {
        return [];
      },
    },
    routerSearchTerms: {
      type: String,
      default: "",
    },
    routerView: {
      type: String,
      default: "",
    },
  },
  methods: {
    highlightEvent(
      eventLocationId: string,
      eventId: string,
      eventData: EventData,
      clickedMapMarker: boolean | false
    ) {
      router.push(`#${eventLocationId}`);
      this.highlightedEventLocationId = eventLocationId;

      if (eventId) {
        if (
          this.markerMap[eventLocationId] &&
          this.markerMap[eventLocationId].events[eventId]
        ) {
          this.selectedEvent = this.markerMap[eventLocationId].events[eventId];
        } else if (eventData) {
          this.selectedEvent = eventData;
        } else {
          throw new Error("Could not find the event data.");
        }
      }

      if (this.markerMap[eventLocationId]) {
        this.markerMap[eventLocationId].marker.setIcon({
          url: require("@/assets/images/highlighted-place-icon.svg").default,
          scaledSize: { width: 20, height: 20 },
        });

        const openSpecificInfowindow = () => {
          const eventTitle =
            this.markerMap[eventLocationId].events[this.highlightedEventId]
              .title;
          const eventLocation =
            this.markerMap[eventLocationId].events[this.highlightedEventId]
              .locationName;

          let infowindowContent = `<b>${eventTitle}</b>`;

          if (eventLocation) {
            infowindowContent = `<div style="text-align:center"><b>${eventTitle}</b></div></div><div style="text-align:center">at ${eventLocation}</div>`;
          }
          this.markerMap.infowindow.setContent(infowindowContent);
          this.markerMap.infowindow.open({
            anchor: this.markerMap[eventLocationId].marker,
            map: this.map,
            shouldFocus: false,
          });
        };

        const openGenericInfowindow = () => {
          this.markerMap.infowindow.setContent(`${numberOfEvents} events`);
          this.markerMap.infowindow.open({
            anchor: this.markerMap[eventLocationId].marker,
            map: this.map,
            shouldFocus: false,
          });
        };

        const numberOfEvents = this.markerMap[eventLocationId].numberOfEvents;

        // If the user mouses over a map marker with multiple events,
        // open a generic infowindow.
        if (clickedMapMarker && numberOfEvents > 1) {
          openGenericInfowindow();
        }

        // If the user mouses over a map marker with a single event,
        // open a specific infowindow.
        else if (clickedMapMarker && numberOfEvents === 1) {
          const defaultEventId = Object.keys(
            this.markerMap[eventLocationId].events
          )[0];
          this.highlightedEventId = defaultEventId;
          openSpecificInfowindow();
        }

        // If the user mouses over an event list item in the event list,
        // always open a specific infowindow.
        else if (eventId) {
          this.highlightedEventId = eventId;
          openSpecificInfowindow();
        }

        if (numberOfEvents > 1) {
          const selectedEventsObject = this.markerMap[eventLocationId].events;
          const getArrayFromObject = (obj: any) => {
            const ary = [];

            for (let key in obj) {
              ary.push(obj[key]);
            }

            return ary;
          };
          const selectedEventsArray = getArrayFromObject(selectedEventsObject);

          this.selectedEvents = selectedEventsArray;
        }
      }
    },
    unhighlight() {
      if (!this.colorLocked) {
        if (this.markerMap.infowindow) {
          this.markerMap.infowindow.close();
        }

        if (this.markerMap[this.highlightedEventLocationId]) {
          this.markerMap[this.highlightedEventLocationId].marker.setIcon({
            url: require("@/assets/images/place-icon.svg").default,
            scaledSize: { width: 20, height: 20 },
          });
        }
        this.highlightedEventId = "";
        this.highlightedEventLocationId = "";
      }
    },
    closeEventPreview() {
      this.eventPreviewIsOpen = false;

      if (!this.multipleEventPreviewIsOpen) {
        this.colorLocked = false;
      }

      this.unhighlight();
    },
    closeMultipleEventPreview() {
      this.multipleEventPreviewIsOpen = false;
      this.colorLocked = false;
      this.unhighlight();
    },
    openPreview(openedFromMap: boolean | false) {
      if (openedFromMap) {
        const eventsAtClickedLocation =
          this.markerMap[this.highlightedEventLocationId].numberOfEvents;

        if (eventsAtClickedLocation > 1) {
          this.multipleEventPreviewIsOpen = true;
        } else {
          this.eventPreviewIsOpen = true;
        }
      } else {
        // If opened from a list,
        // always preview a specific event.
        this.eventPreviewIsOpen = true;
      }

      this.colorLocked = true;
    },
    getTagOptionLabels(options: Array<TagData>) {
      return options.map((tag) => tag.text);
    },
    getChannelOptionLabels(options: Array<ChannelData>) {
      return options.map((channel) => channel.url);
    },
    updateSearchResult(input: string) {
      this.setSearchInput(input);
    },
    updateMapCenter(placeData: any) {
      this.setLocationInput(placeData);

      if (this.showMap) {
        const lat = placeData.geometry.location.lat();
        const lng = placeData.geometry.location.lng();
        this.map.setCenter({
          lng,
          lat,
        });
      }
    },
    filterByTag(tag: string) {
      this.setTagFilters([tag]);
    },
    setMarkerData(data: any) {
      this.markerMap = data.markerMap;
      this.map = data.map;
    },
    setShowMap() {
      this.showMap = true;
      router.push({
        path: "/events",
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
      router.push({
        path: "/events",
        query: {
          search: this.searchInput.value,
          channel: this.selectedChannels.value,
          tag: this.selectedTags.value,
          view: "list",
        },
      });
    },
  },
});
</script>
<template>
  <div>
    <div class="py-3 px-3 inline-flex items-center">
      <LocationSearchBar
        :router-search-terms="routerSearchTerms"
        :search-placeholder="'Location'"
        @updateLocationInput="updateMapCenter"
      />

      <FilterChip :label="'Date'">
        <template v-slot:icon>
          <CalendarIcon />
        </template>
        <template v-slot:content>
          <ul>
            <li>Events in the next month</li>
            <li>Events on the weekend</li>
            <li>Past events</li>
            <li>From _ to _</li>
          </ul>
        </template>
      </FilterChip>

      <FilterChip :label="'Location'">
        <template v-slot:icon>
          <LocationIcon />
        </template>
        <template v-slot:content>
          <ul>
            <li>Both virtual and in-person events</li>
            <li>In-person only</li>
            <li>Virtual only</li>
            <li>Within a radius from an address</li>
          </ul>
        </template>
      </FilterChip>

      <FilterChip :label="'Weekday & Time'">
        <template v-slot:icon>
          <TimeIcon />
        </template>
        <template v-slot:content>
          <WeeklyTimePicker />
        </template>
      </FilterChip>

      <FilterChip :label="channelLabel">
        <template v-slot:icon>
          <ChannelIcon />
        </template>
        <template v-slot:content>
          <ChannelPicker
            v-model="selectedChannels"
            :channel-options="
              getChannelOptionLabels(channelOptions.queryCommunity)
            "
            :selected-channels="selectedChannels"
            @setChannelFilters="setChannelFilters"
          />
        </template>
      </FilterChip>

      <FilterChip :label="tagLabel">
        <template v-slot:icon>
          <TagIcon />
        </template>
        <template v-slot:content>
          <TagPicker
            :tag-options="getTagOptionLabels(tagOptions.queryTag)"
            :selected-tags="selectedTags"
            @setTagFilters="setTagFilters"
          />
        </template>
      </FilterChip>

      <FilterChip :label="'Other Filters'">
        <template v-slot:icon>
          <FilterIcon />
        </template>
        <template v-slot:content>
          <div>
            <label for="location" class="block text-sm font-medium"
              >Search Event Titles and Descriptions</label
            >

            <SearchBar
              :router-search-terms="routerSearchTerms"
              :search-placeholder="'Search'"
              @updateSearchInput="updateSearchResult"
            />

            <label for="free-events" class="block text-sm font-medium mt-3"
              >Show Only Free Events</label
            >
          </div>
        </template>
      </FilterChip>

      <AddToFeed v-if="channelId" />
    </div>
    <ToggleMap
      :show-map="showMap"
      @showMap="setShowMap"
      @showList="setShowList"
    />
    <div
      id="listView"
      v-if="!showMap"
      class="relative text-lg mx-auto max-w-6xl"
    >
      <AddToFeed :class="['float-right']" v-if="channelId" />
      <EventList
        v-if="eventResult && eventResult.queryEvent"
        :events="eventResult.queryEvent"
        :channel-id="channelId"
        :search-input="searchInput"
        :selected-tags="selectedTags"
        :selected-channels="selectedChannels"
        :highlighted-event-id="highlightedEventId"
        :show-map="showMap"
        @filterByTag="filterByTag"
        @highlightEvent="highlightEvent"
        @open-preview="openPreview"
        @unhighlight="unhighlight"
      />
    </div>
    <div v-if="showMap" id="mapView">
      <Map
        v-if="showMap && eventResult && eventResult.queryEvent"
        :events="eventResult.queryEvent"
        :preview-is-open="eventPreviewIsOpen || multipleEventPreviewIsOpen"
        :color-locked="colorLocked"
        @highlightEvent="highlightEvent"
        @open-preview="openPreview"
        @lockColors="colorLocked = true"
        @setMarkerData="setMarkerData"
      />
      <div v-if="eventLoading">Loading...</div>
      <div
        class="overflow-y-scroll"
        style="position: fixed; right: 0; width: 34vw; bottom: 0px"
      >
        <AddToFeed v-if="channelId" />
        <EventList
          class="overscroll-auto overflow-auto"
          key="highlightedEventId"
          v-if="showMap && eventResult && eventResult.queryEvent"
          :events="eventResult.queryEvent"
          :channel-id="channelId"
          :search-input="searchInput"
          :highlighted-event-location-id="highlightedEventLocationId"
          :highlighted-event-id="highlightedEventId"
          :selected-tags="selectedTags"
          :selected-channels="selectedChannels"
          :show-map="showMap"
          @filterByTag="filterByTag"
          @highlightEvent="highlightEvent"
          @open-preview="openPreview"
          @unhighlight="unhighlight"
        />
        <div class="grid justify-items-stretch">
          <button class="justify-self-center" @click="loadMore">
            {{
              reachedEndOfResults ? "There are no more results." : "Load more"
            }}
          </button>
        </div>
      </div>
    </div>

    <div class="col-start-1 row-start-1 py-4"></div>

    <PreviewContainer
      :isOpen="eventPreviewIsOpen && !multipleEventPreviewIsOpen"
      :header="selectedEvent ? selectedEvent.title : 'Untitled'"
      :top-layer="true"
      @closePreview="closeEventPreview"
    >
      <EventPreview
        v-if="selectedEvent"
        :event="selectedEvent"
        @closePreview="closeEventPreview"
      />
    </PreviewContainer>

    <PreviewContainer
      :isOpen="multipleEventPreviewIsOpen"
      :header="'Events at this Location'"
      @closePreview="closeMultipleEventPreview"
    >
      <EventList
        v-if="selectedEvents"
        class="overscroll-auto overflow-auto"
        :events="selectedEvents"
        :channel-id="channelId"
        :highlighted-event-id="highlightedEventId"
        :show-map="showMap"
        @highlightEvent="highlightEvent"
        @open-preview="openPreview"
      />
      <div class="flex-shrink-0 px-4 py-4 flex justify-end">
        <CloseButton @click="closeMultipleEventPreview"/>
      </div>
      <PreviewContainer
        :isOpen="multipleEventPreviewIsOpen && eventPreviewIsOpen"
        :header="selectedEvent ? selectedEvent.title : 'Untitled'"
        :top-layer="true"
        @closePreview="closeEventPreview"
      >
        <EventPreview
          v-if="selectedEvent"
          :event="selectedEvent"
          @closePreview="closeEventPreview"
        />
      </PreviewContainer>
    </PreviewContainer>
  </div>
</template>

<style>
.mapHeight {
  height: 42em;
}

.gray {
  color: gray;
}
</style>