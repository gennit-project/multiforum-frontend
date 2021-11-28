<script lang="js">
import { defineComponent, onMounted } from "vue";
import { Loader } from '@googlemaps/js-api-loader'
import config from "@/config";

export default defineComponent({
  setup(props) {
    const loader = new Loader({ apiKey: config.googleMapsApiKey })

    onMounted(async () => {
      await loader.load()
      // eslint-disable-next-line
      const map = new google.maps.Map(document.getElementById("mapDiv"), {
        center: { lat: 33.4255, lng: -111.94 },
        zoom: 7,
        mapTypeId: "terrain"
      })

      for (let i = 0; i < props.events.length; i++) {
        const event = props.events[i]
        
        if (event.location) {
          // eslint-disable-next-line
          const marker = new google.maps.Marker({
            position: {
              lat: event.location.latitude,
              lng: event.location.longitude
            },
            map,
            title: event.title,
            clickable: true,
            draggable: true,
            mouseover: () => {
              this.$emit('highlightEvent', event.id);
              this.$router.push(`#${event.id}`)
            },
            mouseout: () => {
              this.$emit('highlightEvent', 0);
            },
            icon: {
              url: event.id === props.highlightedEventId
              ? require('@/assets/images/highlighted-place-icon.svg').default
              : require('@/assets/images/place-icon.svg').default,
              scaledSize: { width: 20, height: 20 },
            },
            click: () => {
              this.center = { lat: event.location.latitude, lng: event.location.longitude };
              this.$emit('highlightEvent', event.id);
              this.$emit('openPreview', event);
            }
          });

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
  <div id="mapDiv" style="width: 100%; height: 50rem" />
</template>
<style>
.gm-style-iw > button {
  display: none !important;
}
</style>