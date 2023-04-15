<script lang="ts">
import { defineComponent, onMounted, ref, SetupContext, computed } from "vue";
import { Loader } from '@googlemaps/js-api-loader';
import { useRouter } from 'vue-router'
import config from "@/config";
import gql from "graphql-tag";
import { useQuery } from "@vue/apollo-composable";
import nightModeMapStyles from '@/components/event/list/nightModeMapStyles'

interface Event {
  location: {
    latitude: number;
    longitude: number;
  };
  id: string;
}

interface MarkerMap {
  [key: string]: {
    marker: google.maps.Marker;
    events: { [key: string]: Event };
    numberOfEvents: number;
  };
}

export default defineComponent({
  name: "EventMap",
  props: {
    colorLocked: {
      type: Boolean,
      required: true
    },
    events: {
      type: Array as () => Event[],
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
    // The Google map requires that the styles have to be set
    // when the map is rendered and they can't change based on props.
    // And if we render both mobile and desktop maps with the same map div,
    // with the same ref, and just hide one with CSS, that doesn't work because
    // all markers get painted on both maps twice. That's bad because if a
    // map marker is highlighted, it calls the maps API excessively, and the markers
    // appear to be un-highlighted due the duplicated and overlapping map
    // markers. So the workaround is to create two different maps
    // for desktop and mobile, which reference two different map divs.
    setup(props, { emit }: SetupContext) {
    const router = useRouter()
    const loader = new Loader({ 
      apiKey: config.googleMapsApiKey,
      version: "weekly",
    })

    const GET_THEME = gql`
      query GetTheme {
        theme @client 
      }
    `;

    const { result } = useQuery(GET_THEME);

    const theme = computed(() => {
      return result.value?.theme;
    })

    const mobileMapDiv = ref<HTMLElement | null>(null)
    const desktopMapDiv = ref<HTMLElement | null>(null)
    const map = ref<google.maps.Map | null>(null)

    let markerMap: MarkerMap = {};

    onMounted(async () => {
      await loader.load()

      const mapConfig = {
        center: { lat: 33.4255, lng: -111.94 },
        zoom: 7,
        mapTypeId: "terrain",
        styles: theme.value === 'dark' ? nightModeMapStyles : []
      }
      
      if (props.useMobileStyles) {
        map.value = new google.maps.Map(mobileMapDiv.value!, mapConfig)
      } else {
        map.value = new google.maps.Map(desktopMapDiv.value!, mapConfig)
      }

      let bounds = new google.maps.LatLngBounds();

      const infowindow = new google.maps.InfoWindow()

      for (let i = 0; i < props.events.length; i++) {
        const event = props.events[i];

        if (event.location) {
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

          bounds.extend(marker.getPosition()!);

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
      router,
      theme
    };
  },
  methods: {
    openPreview(event: any) {
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
