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
};

const navigation: NavigationItem[] = [
  {
    name: "Online Events",
    href: "/events/list/search",
    icon: CalendarIcon,
  },
  {
    name: "In-person Events",
    href: "/map",
    icon: LocationIcon,
  },
  {
    name: "Discussions",
    href: "/discussions",
    icon: DiscussionIcon,
  },
  { name: "Channels", href: "/channels", icon: ChannelIcon,  },
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
    class="relative flex w-[250px] flex-shrink-0 flex-grow max-w-xs grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 px-6 pb-2 border"
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
            :active="$route.path.includes(item.href)"
            active-class="text-blue-600"
            
            class="text-gray-700 hover:text-blue-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
          >
            <component
              :is="item.icon"
              class="h-6 w-6 shrink-0 list-item-icon group-hover:text-blue-600"
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
          active-class="text-blue-600"
          class="text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
        >
          My Profile
        </router-link>
        <button
          v-if="!isAuthenticated"
          @click="login"
          class="text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
        >
          Log In
        </button>
        <router-link
          v-if="isAuthenticated"
          to="/logout"
          @click="logout"
          active-class="text-blue-600"
          class="text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
        >
          Sign Out
        </router-link>
      </ul>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
nav li:hover,
nav li:active {
  background-color: #f0f4f8;
  color: #2563eb;
}

.list-item-icon {
  color: #9ca3af;
}
.router-link-exact-active > .list-item-icon {
  color: #2563eb;
}

nav li > .router-link-exact-active {
  background-color: #f0f4f8;
  color: #2563eb 
}
</style>
