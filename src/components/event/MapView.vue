<script lang="ts">
import { defineComponent, PropType, ref, Ref, computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { EventData } from "@/types/eventTypes";
import EventPreview from "./EventPreview.vue";
import EventList from "./EventList.vue";
import EventMap from "./Map.vue";
import PreviewContainer from "./PreviewContainer.vue";
import { useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import XmarkIcon from "../icons/XmarkIcon.vue";
import CloseButton from "../CloseButton.vue";
import { useRoute } from "vue-router";
import { GET_EVENTS } from "@/graphQLData/event/queries";
import getEventWhere from "./getEventWhere";
import { SearchEventValues } from "@/types/eventTypes";
import { getFilterValuesFromParams } from "./getFilterValuesFromParams";
import ErrorBanner from "../ErrorBanner.vue";

export default defineComponent({
  name: "MapView",
  // The SearchEvent component writes to the query
  // params, while the MapView and EventListView
  // components consume the query params.
  props: {
    selectedTags: {
      type: Array as PropType<Array<String>>,
      default: () => {
        return [];
      },
    },
    selectedChannels: {
      type: Array as PropType<Array<String>>,
      default: () => {
        return [];
      },
    },
    channelId: {
      type: String,
      default: "",
    },
    searchInput: {
      type: String,
      default: "",
    },
  },
  components: {
    CloseButton,
    ErrorBanner,
    EventList,
    EventMap,
    EventPreview,
    PreviewContainer,
    XmarkIcon,
  },
  setup() {
    const { smAndDown } = useDisplay();
    const route = useRoute();
    const router = useRouter();
    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    const filterValues: Ref<SearchEventValues> = ref(
      getFilterValuesFromParams(route, channelId.value)
    );

    const resultsOrder = computed(() => {
      // Keep track of results order separately so that query
      // will be refetched when it changes. Otherwise the query
      // would only be refetched when a value inside the eventWhere
      // object is changed.
      return filterValues.value.resultsOrder;
    });

    const eventWhere = computed(() => {
        return getEventWhere(filterValues.value, false)
    })

    const {
      error: eventError,
      result: eventResult,
      loading: eventLoading,
      refetch: refetchEvents,
      onResult: onGetEventResult,
      fetchMore,
    } = useQuery(
      GET_EVENTS,
      {
        limit: 25,
        offset: 0,
        where: eventWhere.value,
        resultsOrder: resultsOrder.value,
      },
      // {
      //   fetchPolicy: "network-only", // If it is not network only, the list
      //   // will not update when an event time changes in a way that affects
      //   // which search results it should be returned in.
      // }
    );

    const reachedEndOfResults = ref(false);

    onGetEventResult((value) => {
      // If the preview pane is blank, fill it with the details
      // of the first result, if there is one.
      if (!value.data || value.data.events.length === 0) {
        return;
      }
      const defaultSelectedEvent = value.data.events[0];

      sendToPreview(defaultSelectedEvent.id, "");
    });

    const previewIsOpen = ref(false);
    const sendToPreview = (eventId: string, eventLocationId: string) => {
      if (eventId) {
        if (!channelId.value) {
          router.push({
            name: "MapEventPreview",
            params: {
              eventId,
            },
            hash: `#${eventLocationId ? eventLocationId : ""}`,
            query: route.query
          });
        } else {
          router.push({
            name: "SearchEventPreview",
            params: {
              eventId,
            },
            hash: `#${eventLocationId ? eventLocationId : ""}`,
            query: route.query
          });
        }
      }
    };
    const loadMore = () => {
      fetchMore({
        variables: {
          offset: eventResult.value.events.length,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult;

          return {
            ...previousResult,
            events: [...previousResult.events, ...fetchMoreResult.events],
          };
        },
      });
    };

    return {
      route,
      router,
      smAndDown,
      eventError,
      eventLoading,
      eventResult,
      filterValues,
      resultsOrder,
      eventWhere,
      loadMore,
      previewIsOpen,
      reachedEndOfResults,
      refetchEvents,
      sendToPreview
    };
  },
  data() {
    

    return {
      highlightedMarker: null,
      mobileMarkerMap: {} as any,
      desktopMarkerMap: {} as any,
      mobileMap: {} as any,
      desktopMap: {} as any,
      colorLocked: false,
      eventPreviewIsOpen: false,
      highlightedEventId: "",
      highlightedEventLocationId: "",
      multipleEventPreviewIsOpen: false,
      selectedEvent: null as EventData | null,
      selectedEvents: [],
    };
  },
  methods: {
    filterByTag(tag: string) {
      this.$emit("filterByTag", tag);
    },
    filterByChannel(channel: string) {
      this.$emit("filterByChannel", channel);
    },
    setMarkerData(data: any) {
      this.mobileMap = data.map;
      this.mobileMarkerMap = data.markerMap;

      // Keep desktop and mobile maps consistent
      this.desktopMap = data.map;
      this.desktopMarkerMap = data.markerMap;
    },
    updateMapCenter(placeData: any) {
        const coords = {
          lat: placeData.geometry.location.lat(),
          lng: placeData.geometry.location.lng(),
        };

        this.mobileMap.setCenter(coords);
        this.desktopMap.setCenter(coords);
    },
    highlightEventOnMap({
      eventId,
      eventLocationId,
      eventData,
      clickedMapMarker,
      markerMap,
      map,
    }: any) {
      if (eventId) {
        if (
          markerMap[eventLocationId] &&
          markerMap[eventLocationId].events[eventId]
        ) {
          this.selectedEvent = markerMap[eventLocationId].events[eventId];
        } else if (eventData) {
          this.selectedEvent = eventData;
        } else {
          throw new Error("Could not find the event data.");
        }
      }

      if (markerMap[eventLocationId]) {
        markerMap[eventLocationId].marker.setIcon({
          url: require("@/assets/images/highlighted-place-icon.svg").default,
          scaledSize: { width: 20, height: 20 },
        });

        const openSpecificInfowindow = () => {
          const eventTitle =
            markerMap[eventLocationId].events[this.highlightedEventId].title;
          const eventLocation =
            markerMap[eventLocationId].events[this.highlightedEventId]
              .locationName;

          let infowindowContent = `<b>${eventTitle}</b>`;

          if (eventLocation) {
            infowindowContent = `<div style="text-align:center"><b>${eventTitle}</b></div></div><div style="text-align:center">at ${eventLocation}</div>`;
          }
          markerMap.infowindow.setContent(infowindowContent);
          markerMap.infowindow.open({
            anchor: markerMap[eventLocationId].marker,
            map,
            shouldFocus: false,
          });
        };

        const openGenericInfowindow = () => {
          markerMap.infowindow.setContent(`${numberOfEvents} events`);
          markerMap.infowindow.open({
            anchor: markerMap[eventLocationId].marker,
            map,
            shouldFocus: false,
          });
        };

        const numberOfEvents = markerMap[eventLocationId].numberOfEvents;
        // If the user mouses over a map marker with multiple events,
        // open a generic infowindow.
        if (clickedMapMarker && numberOfEvents > 1) {
          openGenericInfowindow();
        }

        // If the user mouses over a map marker with a single event,
        // open a specific infowindow.
        else if (clickedMapMarker && numberOfEvents === 1) {
          const defaultEventId = Object.keys(
            markerMap[eventLocationId].events
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
          const selectedEventsObject = markerMap[eventLocationId].events;
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
    highlightEvent(
      eventLocationId: string,
      eventId: string,
      eventData: EventData,
      clickedMapMarker: boolean | false
    ) {
      this.sendToPreview( eventId, eventLocationId);

      this.highlightedEventLocationId = eventLocationId;

      // Keep desktop and mobile maps in sync
      this.highlightEventOnMap({
        eventId,
        eventLocationId,
        eventData,
        clickedMapMarker,
        markerMap: this.mobileMarkerMap,
        map: this.mobileMap,
      });
      this.highlightEventOnMap({
        eventId,
        eventLocationId,
        eventData,
        clickedMapMarker,
        markerMap: this.desktopMarkerMap,
        map: this.desktopMap,
      });
    },
    unhighlightEventOnMap(markerMap: any) {
      if (!this.colorLocked) {
        if (markerMap.infowindow) {
          markerMap.infowindow.close();
        }

        if (markerMap[this.highlightedEventLocationId]) {
          markerMap[this.highlightedEventLocationId].marker.setIcon({
            url: require("@/assets/images/place-icon.svg").default,
            scaledSize: { width: 20, height: 20 },
          });
        }
        this.highlightedEventId = "";
        this.highlightedEventLocationId = "";
      }
    },
    unhighlight() {
      // Keep desktop and mobile map markers consistent
      this.unhighlightEventOnMap(this.mobileMarkerMap);
      this.unhighlightEventOnMap(this.desktopMarkerMap);
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
    openPreview(event: EventData, openedFromMap: boolean | false) {
      if (openedFromMap) {
        // When opening from a map, count how
        // many events are at the clicked location.
        // If there is one event, open the preview for
        // that event. If there is more than one,
        // open a preview for multiple events.
        const eventsAtClickedLocation =
          // We assume desktop and mobile marker maps are in sync.
          this.desktopMarkerMap[this.highlightedEventLocationId].numberOfEvents;

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
      this.selectedEvent = event;
      this.colorLocked = true;
    },
    clickCloseMap(){
      this.$router.push({ 
        path: "/events/list",
        query: {...this.$route.query}
      })
    }
  },
  // created() {
  //       this.$watch(
  //       () => this.$route.params,
  //       ()=> {
  //       // (toParams, previousParams) => {
  //           // react to route changes...
  //       }
  //       )
  //   },
});
</script>
<template>
  <div class="mx-auto">
    <div v-if="eventLoading">Loading...</div>
    <ErrorBanner
      class="block"
      v-else-if="eventError"
      :text="eventError.message"
    />
    <div id="mapViewMobileWidth" v-else-if="smAndDown && eventResult && eventResult.events">
      <EventMap
        v-if="eventResult.events.length > 0"
        :events="eventResult.events"
        :preview-is-open="eventPreviewIsOpen || multipleEventPreviewIsOpen"
        :color-locked="colorLocked"
        :use-mobile-styles="true"
        @highlightEvent="highlightEvent"
        @open-preview="openPreview"
        @lockColors="colorLocked = true"
        @setMarkerData="setMarkerData"
      />
    </div>
    <div  v-else-if="!smAndDown && eventResult && eventResult.events" id="mapViewFullScreen" class="flex flex-row">
      <div
        class="h-full max-h-screen overflow-y-auto flex-col flex-grow border border-2"
        style="width: 34vw"
      >
      <div class="ml-4 flex-shrink-0 flex" @click="clickCloseMap">
        <button
          type="button"
          class="
            my-2
            cursor-pointer
            bg-white
            rounded-full
            inline-flex
            text-gray-400
            hover:text-gray-500
            focus:outline-none
            focus:ring-2
            focus:ring-offset-2
            focus:ring-indigo-500
            align-middle
          "
        >
          <XmarkIcon class="h-5 w-5 mt-0.5" aria-hidden="true" />
          Close Map
        </button>
      </div>
        <EventList
          key="highlightedEventId"
          :events="eventResult.events"
          :channel-id="channelId"
          :search-input="searchInput"
          :highlighted-event-location-id="highlightedEventLocationId"
          :highlighted-event-id="highlightedEventId"
          :selected-tags="selectedTags"
          :selected-channels="selectedChannels"
          :show-map="true"
          :loaded-event-count="eventResult.events.length"
          :result-count="eventResult.eventsAggregate?.count"
          @filterByTag="filterByTag"
          @filterByChannel="filterByChannel"
          @highlightEvent="highlightEvent"
          @open-preview="openPreview"
          @unhighlight="unhighlight"
        />
      </div>
      <div style="right: 0; width: 66vw">
        <EventMap
          class="fixed"
          v-if="eventResult.events.length > 0"
          :events="eventResult.events"
          :preview-is-open="eventPreviewIsOpen || multipleEventPreviewIsOpen"
          :color-locked="colorLocked"
          :use-mobile-styles="false"
          @highlightEvent="highlightEvent"
          @open-preview="openPreview"
          @lockColors="colorLocked = true"
          @setMarkerData="setMarkerData"
        />
      </div>
    </div>
    <EventPreview
      :top-layer="true"
      :isOpen="eventPreviewIsOpen && !multipleEventPreviewIsOpen"
      @closePreview="closeEventPreview"
    />
    <PreviewContainer
      :isOpen="multipleEventPreviewIsOpen"
      :header="'Events at this Location'"
      @closePreview="closeMultipleEventPreview"
    >
      <EventList
        v-if="selectedEvents"
        class="overscroll-auto overflow-auto"
        :events="selectedEvents"
        :result-count="selectedEvents.length"
        :channel-id="channelId"
        :highlighted-event-id="highlightedEventId"
        :show-map="true"
        @highlightEvent="highlightEvent"
        @open-preview="openPreview"
      />
      <div class="flex-shrink-0 px-4 py-4 flex justify-end">
        <CloseButton @click="closeMultipleEventPreview" />
      </div>
      <PreviewContainer
        :isOpen="multipleEventPreviewIsOpen && eventPreviewIsOpen"
        :top-layer="true"
        @closePreview="closeEventPreview"
      >
        <router-view></router-view>
      </PreviewContainer>
    </PreviewContainer>
  </div>
</template>