<script lang="js">
import { defineComponent, onMounted, ref } from "vue";
import { Loader } from '@googlemaps/js-api-loader';
import useEmitter from '@/composables/useEmitter';
import { useRouter } from 'vue-router'
import config from "@/config";

export default defineComponent({
  setup(props, { emit }) {
    const emitter = useEmitter()
    const router = useRouter()
    const loader = new Loader({ apiKey: config.googleMapsApiKey })
    const mapDiv = ref(null)
    let map = ref(null)

    onMounted(async () => {
      await loader.load()
      // eslint-disable-next-line
      map.value = new google.maps.Map(mapDiv.value, {
        center: { lat: 33.4255, lng: -111.94 },
        zoom: 7,
        mapTypeId: "terrain"
      })

      emitter.on("highlightEvent", eventId => {
        emit('highlightEvent', eventId);
      });

      emitter.on("openPreview", eventId => {
        emit('openPreview', eventId);
      });

      for (let i = 0; i < props.events.length; i++) {
        const event = props.events[i]

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
              url: event.id === props.highlightedEventId
              ? require('@/assets/images/highlighted-place-icon.svg').default
              : require('@/assets/images/place-icon.svg').default,
              scaledSize: { width: 20, height: 20 },
            },
          });

          marker.addListener("click", () => {
            map.value.setZoom(8);
            map.value.setCenter(marker.getPosition());
            emit("highlightEvent", event.id)
            emit("openPreview", event.id)
          })

          marker.addListener("mouseover", () => {
            emit('highlightEvent', event.id);
            router.push({
              name: `#${event.id}`
            })
          })

          marker.addListener("mouseout", () => {
            emit('highlightEvent', 0);
          })

          // eslint-disable-next-line
          const infowindow = new google.maps.InfoWindow({
            content: event.title
          })

          if (props.highlightedEventId === event.id) {
            infowindow.open({
              anchor: marker,
              map,
              shouldFocus: false
            })
          }
        }
      }
    })

    return {
      center: { lat: 33.4255, lng: -111.94 },
      mapDiv
    };
  },
  props: {
    highlightedEventId: {
      type: String,
      required: true,
    },
    events: {
      type: Array,
      default: () => {return []},
    },
  },
  methods: {
    openPreview() {
      this.$emit("openPreview");
    },
  },
});
</script>

<template>
  <div ref="mapDiv" style="width: 100%; height: 50rem" />
</template>
<style>
.gm-style-iw > button {
  display: none !important;
}
</style>
