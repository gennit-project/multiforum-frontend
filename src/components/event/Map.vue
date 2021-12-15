<script lang="js">
import { defineComponent, onMounted, ref } from "vue";
import { Loader } from '@googlemaps/js-api-loader';
import { useRouter } from 'vue-router'
import config from "@/config";

export default defineComponent({
  setup(props, { emit }) {
    const router = useRouter()
    const loader = new Loader({ apiKey: config.googleMapsApiKey })
    const mapDiv = ref(null)
    let map = ref(null)
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
            title: event.title,
            clickable: true,
            draggable: true,
            icon: {
              url: require('@/assets/images/place-icon.svg').default,
              scaledSize: { width: 20, height: 20 },
            },
          });

          // Extend the map bounds to include each marker's position
          // as shown in this Stack Overflow answer https://stackoverflow.com/questions/15719951/auto-center-map-with-multiple-markers-in-google-maps-api-v3
          bounds.extend(marker.position);

          // eslint-disable-next-line
          const infowindow = new google.maps.InfoWindow({
            content: event.title
          })

          marker.addListener("click", () => {
            emit("highlightEvent", event.id)
            emit("openPreview", event)
            emit("lockColors")
          })


          marker.addListener("mouseover", () => {
            if (!props.colorLocked) {
              emit('highlightEvent', event.id);
              router.push(`#${event.id}`)
            }
          })

          marker.addListener("mouseout", () => {

            const unHighlight = (eventId, marker) => {
              if (!props.colorLocked) {
                if (router.currentRoute.value.fullPath.includes(eventId)) {
                  emit('highlightEvent', '0');
                }
              
                marker.setIcon({
                  url: require('@/assets/images/place-icon.svg').default,
                  scaledSize: { width: 20, height: 20 },
                })
                infowindow.close();
              }
            }
            unHighlight(event.id, marker)
          })

          markerMap[event.id] = {
            marker,
            infowindow
          }
        }
      } // end of loop over events

      map.value.fitBounds(bounds);

      emit('setMarkerData', {
        markerMap,
        map: map.value
      });
    })
    

    return {
      center: { lat: 33.4255, lng: -111.94 },
      mapDiv,
      router
    };
  },
  props: {
    colorLocked: {
      type: Boolean,
      required: true
    },
    highlightedEventId: {
      type: String,
      required: true,
    },
    events: {
      type: Array,
      default: () => {return []},
    },
    previewIsOpen: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    openPreview() {
      this.$emit("openPreview");
    },
  },
});
</script>

<template>
  <div ref="mapDiv" style="position: fixed; width: 66vw; height: calc(100vh - 130px)" />
</template>
<style>
.gm-style-iw > button {
  display: none !important;
}
</style>
