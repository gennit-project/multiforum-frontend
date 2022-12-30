<script lang="js">
import { defineComponent, onMounted, ref } from "vue";
import { Loader } from '@googlemaps/js-api-loader';
import { useRouter } from 'vue-router'
import config from "@/config";

export default defineComponent({
  name: "EventMap",
  props: {
    colorLocked: {
      type: Boolean,
      required: true
    },
    events: {
      type: Array,
      default: () => { return [] },
    },
    previewIsOpen: {
      type: Boolean,
      default: false
    },
    useMobileStyles: {
      type: Boolean,
      required: true
    }
  },
  setup(props, { emit }) {
    const router = useRouter()
    const loader = new Loader({ apiKey: config.googleMapsApiKey })
    const mobileMapDiv = ref(null)
    const desktopMapDiv = ref(null)
    let map = ref(null)

    // Only have one marker per location, even if multiple
    // events are at the location.
    let markerMap = {};


    onMounted(async () => {
      await loader.load()

      const mapConfig = {
        center: { lat: 33.4255, lng: -111.94 },
        zoom: 7,
        mapTypeId: "terrain"
      }
      /* eslint-disable */
      if (props.useMobileStyles) {
        // The Google map requires that the styles have to be set
        // when the map is rendered and they can't change based on props.
        // And if we render both mobile and desktop maps with the same map div,
        // with the same ref, and just hide one with CSS, that doesn't work because
        // all markers get painted on both maps twice. That's bad because if a
        // map marker is highlighted, it calls the maps API excessively, and the markers
        // appear to be un-highlighted due the duplicated and overlapping map
        // markers. So the workaround is to create two different maps
        // for desktop and mobile, which reference two different map divs.
        map.value = new google.maps.Map(mobileMapDiv.value, mapConfig)
      } else {
        map.value = new google.maps.Map(desktopMapDiv.value, mapConfig)
      }

      let bounds = new google.maps.LatLngBounds();

      const infowindow = new google.maps.InfoWindow()
      /* eslint-enable */

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
            }
          })

          marker.addListener("mouseout", () => {

            const unhighlight = (marker) => {
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
            unhighlight(marker)
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
      mobileMapDiv,
      desktopMapDiv,
      router
    };
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
      v-else-if="useMobileStyles" 
      ref="mobileMapDiv" 
      style="width: 100vw; height: 50vw;"
    >
    </div>
    <div
      v-else-if="!useMobileStyles"
      ref="desktopMapDiv"
      style="position: fixed; width: 66vw; height: 100vh;"
    >
    </div>
</template>
<style>
.gm-style-iw>button {
  display: none !important;
}
</style>
