<script lang="ts">
import { defineComponent, computed } from "vue";
import Identicon from 'identicon.js';
import sha256 from 'crypto-js/sha256';

export default defineComponent({

  props: {
    username: {
      type: String,
      required: true
    }
  },
  setup() {

  },
  computed: {
    identiconData() {
      // Hash the username
      const hash = sha256(this.username).toString();

      // Generate the identicon and get the data for the img src
      const data = new Identicon(hash, {
        background: [240, 240, 240, 255],
        margin: 0.2,
        size: 420,
        format: 'svg'
      }).toString();

      // Return the data as a base64 SVG for the src of the img
      return 'data:image/svg+xml;base64,' + data;
    },
  },
});
</script>
<template>

  <img class="h-8 w-8 rounded-full" :src="identiconData" :alt="username">
</template>


