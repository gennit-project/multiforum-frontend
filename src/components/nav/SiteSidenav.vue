<script lang="ts">
import { defineComponent, computed } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
import CalendarIcon from "@/components/icons/CalendarIcon.vue";
import LocationIcon from "@/components/icons/LocationIcon.vue";
import DiscussionIcon from "@/components/icons/DiscussionIcon.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import UserCircle from "@/components/icons/UserCircle.vue";
import XIcon from "@/components/icons/XmarkIcon.vue";

type NavigationItem = {
  name: string;
  href: string;
  icon: any;
  current: boolean;
};

const navigation: NavigationItem[] = [
  {
    name: "Online Events",
    href: "/events/list/search",
    icon: CalendarIcon,
    current: false,
  },
  {
    name: "In-person Events",
    href: "/map",
    icon: LocationIcon,
    current: false,
  },
  {
    name: "Discussions",
    href: "/discussions",
    icon: DiscussionIcon,
    current: false,
  },
  { name: "Channels", href: "/channels", icon: ChannelIcon, current: false },
];

export default defineComponent({
  components: {
    CalendarIcon,
    LocationIcon,
    DiscussionIcon,
    ChannelIcon,
    XIcon,
    UserCircle
  },
  setup() {
    const { isAuthenticated, logout, loginWithRedirect, user } = useAuth0();

    const username = computed(() => {
      if (user) {
        return user.value.username;
      }
      return "";
    });

    return {
      isAuthenticated,
      login: () => {
        loginWithRedirect();
      },
      logout: () => {
        logout({ returnTo: "http://localhost:5173/logout" });
      },
      navigation,
      username,
    };
  },
  props: {
    showDropdown: {
      type: Boolean,
      required: true,
    },
  },
});
</script>
<template>
  <div
    v-if="showDropdown"
    class="relative flex w-[250px] flex-shrink-0 h-full max-w-xs grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2 border"
  >
    <div class="flex items-end justify-end mt-2">
      <div class="h-7 flex items-center">
        <button
          type="button"
          class="ml-8 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @click="$emit('close')"
        >
          <span class="sr-only">Close panel</span>
          <XIcon class="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </div>
    <nav class="flex flex-1 flex-col">
      <ul role="list" class="flex flex-1 flex-col">
        <li v-for="item in navigation" :key="item.name">
          <router-link
            :to="item.href"
            :class="[
              item.current
                ? 'bg-gray-50 text-blue-600'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50',
              'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
            ]"
          >
            <component
              :is="item.icon"
              :class="[
                item.current
                  ? 'text-blue-600'
                  : 'text-gray-400 group-hover:text-blue-600',
                'h-6 w-6 shrink-0',
              ]"
              aria-hidden="true"
            />
            {{ item.name }}
          </router-link>
        </li>
      </ul>

      <ul>
        <router-link
          v-if="isAuthenticated"
          :to="`/u/${username}`"
          class="hover:bg-gray-50 hover:text-blue-600 text-gray-700 hover:text-blue-600 hover:bg-gray-50', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']"
          active-class="bg-gray-900 text-white"
        >
          My Profile
        </router-link>
        <button
          v-if="!isAuthenticated"
          @click="login"
          class="hover:bg-gray-50 hover:text-blue-600 text-gray-700 hover:text-blue-600 hover:bg-gray-50', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']"
          active-class="bg-gray-900 text-white"
        >
          Log In
        </button>
        <router-link
          v-if="isAuthenticated"
          to="/logout"
          @click="logout"
          class="hover:bg-gray-50 hover:text-blue-600 text-gray-700 hover:text-blue-600 hover:bg-gray-50', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']"
          active-class="bg-gray-900 text-white"
        >
          Sign Out
        </router-link>
      </ul>
    </nav>
  </div>
</template>
