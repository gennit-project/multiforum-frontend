<script lang="js">
import { defineComponent, onMounted, ref } from "vue";
import { Loader } from '@googlemaps/js-api-loader';
import { useRouter } from 'vue-router'
import config from "@/config";

export default defineComponent({
  name: "EventMap",
  setup(props, { emit }) {
    const router = useRouter()
    const loader = new Loader({ apiKey: config.googleMapsApiKey })
    const mapDiv = ref(null)
    let map = ref(null)

    // Only have one marker per location, even if multiple
    // events are at the location.
    let markerMap = {};


    onMounted(async () => {
      await loader.load()
      // eslint-disable-next-line
      map.value = new google.maps.Map(mapDiv.value, {
        center: { lat: 33.4255, lng: -111.94 },
        zoom: 7,
        mapTypeId: "terrain"
      })

      // eslint-disable-next-line
      let bounds = new google.maps.LatLngBounds();

      // eslint-disable-next-line
      const infowindow = new google.maps.InfoWindow()

      for (let i = 0; i < props.events.length; i++) {
        const event = props.events[i];
        
        if (event.location) {
          // eslint-disable-next-line
          const marker = new google.maps.Marker({
            position: {
              lat: event.location.latitude,
              lng: event.location.longitude
            },
            map: map.value,
            clickable: true,
            draggable: true,
            icon: {
              url: require('@/assets/images/place-icon.svg').default,
              scaledSize: { width: 20, height: 20 },
            }
          });

          // Extend the map bounds to include each marker's position
          // as shown in this Stack Overflow answer https://stackoverflow.com/questions/15719951/auto-center-map-with-multiple-markers-in-google-maps-api-v3
          bounds.extend(marker.position);

          const eventLocationId = event.location.latitude.toString() + event.location.longitude.toString();
          
          marker.addListener("click", () => {
            emit("openPreview", event, true)
            emit("lockColors")
          })


          marker.addListener("mouseover", () => {
            if (!props.colorLocked) {
              emit('highlightEvent', eventLocationId, event.id, event, true);
              router.push(`#${eventLocationId}`)
            }
          })

          marker.addListener("mouseout", () => {

            const unhighlight = (eventId, marker) => {
              if (!props.colorLocked) {
                if (router.currentRoute.value.fullPath.includes(eventLocationId)) {
                  emit('unHighlight');
                }
              
                marker.setIcon({
                  url: require('@/assets/images/place-icon.svg').default,
                  scaledSize: { width: 20, height: 20 },
                })
                infowindow.close();
              }
            }
            unhighlight(eventLocationId, marker)
          })


          const updateMarkerMap = () => {

            if (markerMap[eventLocationId]) {
              const numberOfEvents = markerMap[eventLocationId].numberOfEvents;

              markerMap[eventLocationId].events[event.id] = event;
              markerMap[eventLocationId].numberOfEvents = numberOfEvents + 1;
              markerMap[eventLocationId].marker = marker;
            } else {
              markerMap[eventLocationId] = {
                marker,
                events: {
                  [event.id]: event
                },
                numberOfEvents: 1
              }
            }
          }

          updateMarkerMap();
        }
      } // end of loop over events

      markerMap.infowindow = infowindow;

      map.value.fitBounds(bounds);

      emit('setMarkerData', {
        markerMap,
        map: map.value
      });
    })
    
    const center = ref(props.referencePoint);

    return {
      center,
      mapDiv,
      router
    };
  },
  props: {
    colorLocked: {
      type: Boolean,
      required: true
    },
    events: {
      type: Array,
      default: () => {return []},
    },
    previewIsOpen: {
      type: Boolean,
      default: false
    },
    useMobileStyles: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    openPreview(event) {
      this.$emit("openPreview", event, true);
    },
  },
});
</script>

<template>
  <p class="mx-3" v-if="events.length === 0">
    Could not find any events with a location.
  </p>
  <div
    v-else
    ref="mapDiv"
    :style="[useMobileStyles ? 'width: 100vw; height: 100vw;' : 'position: fixed; width: 66vw; height: calc(100vh - 56px)']"
  />
</template>
<style>
.gm-style-iw > button {
  display: none !important;
}
</style>
