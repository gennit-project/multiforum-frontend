<script lang="ts">
import { defineComponent } from "vue";
import places from "../../testData/places";

export default defineComponent({
  setup() {
    return {
      center: { lat: 33.4255, lng: -111.94 },
      places,
    };
  },
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
          v-for="place in places"
          :key="place.Name"
          :position="{ lat: place.Latitude, lng: place.Longitude }"
          :clickable="true"
          :draggable="true"
          @click="center = { lat: place.Latitude, lng: place.Longitude }"
        >
          <GMapInfoWindow>
            {{ place.Name }}
          </GMapInfoWindow>
        </GMapMarker>
      </GMapCluster>
    </GMapMap>
  </div>
</template>