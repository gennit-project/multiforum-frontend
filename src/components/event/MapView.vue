<script>
import { defineComponent } from "vue";
import EventPreview from "./EventPreview.vue";
import EventMap from "./Map.vue";
import PreviewContainer from "./PreviewContainer.vue";
import CloseButton from "@/components/buttons/CloseButton.vue";

export default defineComponent({
  components: {
    CloseButton,
    EventPreview,
    EventMap,
    PreviewContainer,
  },
  setup() {},
  methods: {
    setMarkerData(data: any) {
      this.markerMap = data.markerMap;
      this.map = data.map;
    },
    updateMapCenter(placeData: any) {
      if (this.showMap) {
        const lat = placeData.geometry.location.lat();
        const lng = placeData.geometry.location.lng();

        this.map.setCenter({
          lng,
          lat,
        });
      }
    },
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
    openPreview(event: EventData, openedFromMap: boolean | false) {
      if (openedFromMap) {
        // When opening from a map, count how
        // many events are at the clicked location.
        // If there is one event, open the preview for
        // that event. If there is more than one,
        // open a preview for multiple events.
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
      this.selectedEvent = event;
      this.colorLocked = true;
    },
  },
});
</script>
<template>
  <div id="mapView" class="overflow-y-scroll">
    <div style="position: fixed; width: 66vw; height: calc(100vh - 130px)">
      <EventMap
        :events="eventResult.events"
        :preview-is-open="eventPreviewIsOpen || multipleEventPreviewIsOpen"
        :color-locked="colorLocked"
        @highlightEvent="highlightEvent"
        @open-preview="openPreview"
        @lockColors="colorLocked = true"
        @setMarkerData="setMarkerData"
      />
    </div>
    <div style="position: fixed; right: 0; width: 34vw">
      <EventList
        class="overscroll-auto overflow-auto"
        key="highlightedEventId"
        :events="eventResult.events"
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
          {{ reachedEndOfResults ? "There are no more results." : "Load more" }}
        </button>
      </div>
    </div>
  </div>

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
      <CloseButton @click="closeMultipleEventPreview" />
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
</template>