<script>
import {
  defineComponent,
  ref,
  onBeforeUnmount,
  onMounted,
  nextTick,
} from "vue";
import { useAuth0 } from "@auth0/auth0-vue";

export default defineComponent({
  props: {
    showUserProfileDropdown: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const { logout } = useAuth0();

    const useDetectOutsideClick = (component, callback) => {
      // Used code from this tutorial https://dev.to/erefor/vue-3-tip-detect-click-outside-4e4k
      if (!component) return;
      const listener = (event) => {
        if (
          event.target !== component.value &&
          event.composedPath().includes(component.value)
        ) {
          return;
        }
        if (typeof callback === "function") {
          callback();
        }
      };
      onMounted(() => {
        window.addEventListener("click", listener);
      });
      onBeforeUnmount(() => {
        window.removeEventListener("click", listener);
      });

      return { listener };
    };

    const userProfileDropdownRef = ref();

    useDetectOutsideClick(userProfileDropdownRef, () => {
      if (props.showUserProfileDropdown === true) {
        setTimeout(() => {
          emit("closeUserProfileDropdown");
        }, "2000");
      }
    });

    return {
      userProfileDropdownRef,
      logout: () => {
        logout({ returnTo: "http://localhost:5173/logout" });
      },
    };
  },
});
</script>
<template>
  <!--
    Dropdown menu, show/hide based on menu state.

    Entering: "transition ease-out duration-100"
    From: "transform opacity-0 scale-95"
    To: "transform opacity-100 scale-100"
    Leaving: "transition ease-in duration-75"
    From: "transform opacity-100 scale-100"
    To: "transform opacity-0 scale-95"
-->
  <div
    v-if="showUserProfileDropdown"
    ref="userProfileDropdownRef"
    class="
      origin-top-right
      absolute
      right-0
      mt-2
      w-48
      rounded-md
      shadow-lg
      py-1
      bg-white
      ring-1 ring-black ring-opacity-5
      focus:outline-none
      z-10
    "
    role="menu"
    aria-orientation="vertical"
    aria-labelledby="user-menu-button"
    tabindex="-1"
  >
    <router-link
      to="/myProfile"
      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      role="menuitem"
      tabindex="-1"
      id="user-menu-item-0"
      >My Profile</router-link
    >
    <!-- <router-link
      to="settings"
      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      role="menuitem"
      tabindex="-1"
      id="user-menu-item-1"
      >Settings</router-link
    > -->
    <router-link
      to="/logout"
      @click="logout"
      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      role="menuitem"
      tabindex="-1"
      id="user-menu-item-2"
      >Sign out</router-link
    >
  </div>
</template>
