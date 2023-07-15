<script lang="ts">
import { defineComponent, computed } from "vue";
import Identicon from 'identicon.js';
import sha256 from 'crypto-js/sha256';
import { useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";

export default defineComponent({

  props: {
    username: {
      type: String,
      required: true
    }
  },
  setup() {
    const GET_THEME = gql`
      query getTheme {
        theme @client
      }
    `;

    const {
      result: themeResult,
      loading: themeLoading,
      error: themeError,
    } = useQuery(GET_THEME);

    const theme = computed(() => {
      if (themeLoading.value || themeError.value) {
        return "";
      }
      return themeResult.value.theme;
    });

    return {
      theme,
    };
  },
  computed: {
    identiconData() {
      // Hash the username
      const hash = sha256(this.username).toString();

      // Generate the identicon and get the data for the img src
      const data = new Identicon(hash, {
        // If theme is dark, use a dark background
        background: this.theme === 'dark' ? [0, 0, 0, 255] : [255, 255, 255, 255],
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


