<script lang="ts">
import { defineComponent, PropType } from "vue";
import { EventData } from "../../types/eventTypes";

export default defineComponent({
  setup() {
    return {
      center: { lat: 33.4255, lng: -111.94 },
      
    };
  },
  data() {
    return {
      openedEventId: null as number | null,
      highlightedEventId: null as number | null
    }
  },
  props: {
    events: {
      type: Array as PropType<EventData[]>,
      required: true
    }
  },
  methods: {
    openPreview() {
      this.$emit('openPreview');
    },
  }
});
</script>

<template>
  <div>
    <GMapMap
      :center="center"
      :zoom="7"
      map-type-id="terrain"
      style="width: 100vw; height: 50rem"
    >
      <GMapCluster
        :zoomOnClick="true"
        :styles="[
          {
            textColor: 'black',
            url: 'https://raw.githubusercontent.com/googlemaps/v3-utility-library/37c2a570c318122df57b83140f5f54665b9359e5/packages/markerclustererplus/images/m1.png',
            height: 52,
            width: 53,
          },
          {
            textColor: 'black',
            url: 'https://raw.githubusercontent.com/googlemaps/v3-utility-library/37c2a570c318122df57b83140f5f54665b9359e5/packages/markerclustererplus/images/m2.png',
            height: 55,
            width: 56,
          },
          {
            textColor: 'black',
            url: 'https://raw.githubusercontent.com/googlemaps/v3-utility-library/37c2a570c318122df57b83140f5f54665b9359e5/packages/markerclustererplus/images/m3.png',
            height: 65,
            width: 66,
          },
          {
            textColor: 'black',
            url: 'https://raw.githubusercontent.com/googlemaps/v3-utility-library/37c2a570c318122df57b83140f5f54665b9359e5/packages/markerclustererplus/images/m4.png',
            height: 77,
            width: 78,
          },
          {
            textColor: 'black',
            url: 'https://raw.githubusercontent.com/googlemaps/v3-utility-library/37c2a570c318122df57b83140f5f54665b9359e5/packages/markerclustererplus/images/m5.png',
            height: 89,
            width: 90,
          },
        ]"
      >
        <GMapMarker
          v-for="event in events"
          :key="event.name"
          :position="{ lat: event.latitude, lng: event.longitude }"
          :clickable="true"
          :draggable="true"
          @mouseover="() => {
            highlightedEventId = event.id
            openedEventId = event.id
          }"
          @mouseout="() => {
            highlightedEventId = null
            openedEventId = null
          }"
          :icon="{
            url: event.id === highlightedEventId ? require('@/assets/images/highlighted-place-icon.svg').default : require('@/assets/images/place-icon.svg').default,
            scaledSize: { width: 20, height: 20}
          }"
          @click="() => {
            center = { lat: event.latitude, lng: event.longitude };
            openedEventId = event.id;
            $emit('openPreview', event);
          }"
        >
          <GMapInfoWindow
            :opened="openedEventId === event.id"
          >
            {{ event.name }}
          </GMapInfoWindow>
        </GMapMarker>
      </GMapCluster>
    </GMapMap>
  </div>
</template>
<style>
.gm-style-iw > button {
  display: none !important;
}
</style>