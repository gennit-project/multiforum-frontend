<script lang="ts">
import { defineComponent, ref } from "vue";
import IconButtonDropdown from "../generic/IconButtonDropdown.vue";

export default defineComponent({
  components: {
    IconButtonDropdown,
  },

  setup() {
    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    const updateTheme = () => {
      if (
        localStorage.theme === "dark" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };
    return {
      updateTheme,
    };
  },
  methods: {
    // Set theme in local storage
    setLightMode() {
      localStorage.setItem("theme", "light");
      this.updateTheme();
    },
    setDarkMode() {
      localStorage.setItem("theme", "dark");
      this.updateTheme();
    },
    setSystemMode() {
      localStorage.removeItem("theme");
      this.updateTheme();
    },
  },
});
</script>

<template>
  <IconButtonDropdown
    :menu-button-icon="'fa-regular fa-sun'"
    :items="[
      {
        label: 'Light Mode',
        icon: 'fa-regular fa-sun',
        event: 'lightMode',
      },
      {
        label: 'Dark Mode',
        icon: 'fa-regular fa-moon',
        event: 'darkMode',
      },
      {
        label: 'System',
        icon: 'fa-solid fa-desktop',
        event: 'systemMode',
      },
    ]"
    @lightMode="setLightMode"
    @darkMode="setDarkMode"
    @systemMode="setSystemMode"
  />
</template>
