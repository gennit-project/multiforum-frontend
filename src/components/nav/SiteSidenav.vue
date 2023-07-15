<script lang="ts">
import { defineComponent, computed } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
import CalendarIcon from "@/components/icons/CalendarIcon.vue";
import LocationIcon from "@/components/icons/LocationIcon.vue";
import DiscussionIcon from "@/components/icons/DiscussionIcon.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import UserCircle from "@/components/icons/UserCircle.vue";
import XIcon from "@/components/icons/XmarkIcon.vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";

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
  { name: "Channels", href: "/channels", icon: ChannelIcon },
];

export default defineComponent({
  components: {
    CalendarIcon,
    LocationIcon,
    DiscussionIcon,
    ChannelIcon,
    XIcon,
    UserCircle,
  },
  setup() {
    const { isAuthenticated, logout, loginWithRedirect } = useAuth0();

    const { result: localUsernameResult } = useQuery(GET_LOCAL_USERNAME);

    const username = computed(() => {
      let username = localUsernameResult.value?.username;
      if (username) {
        return username;
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
    class="fixed top-0 left-0 z-50 w-[250px] h-screen overflow-y-auto bg-white dark:bg-slate-900 py-2 border flex flex-col justify-between"
  >
    <div>
      <div class="block mt-2 px-6">
        <div class="h-7 flex">
          <button
            type="button"
            class="rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @click="$emit('close')"
          >
            <span class="sr-only">Close panel</span>
            <XIcon class="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      <nav class="mt-16">
        <ul role="list">
          <li v-for="item in navigation" :key="item.name" class="px-6">
            <router-link
              :to="item.href"
              :active="$route.path.includes(item.href)"
              :data-testid="`nav-link-${item.name}`"
              active-class="text-blue-600"
              class="text-gray-700 dark:text-gray-300 pl-2 hover:text-blue-600 dark:hover:text-gray-300 dark:hover:bg-slate-800 group flex gap-x-3 rounded-md py-2 text-sm leading-6 font-semibold"
              @click="$emit('close')"
            >
              <component
                :is="item.icon"
                class="h-6 w-6 shrink-0 list-item-icon"
                aria-hidden="true"
              />
              {{ item.name }}
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
    <ul class="mb-6 px-6">
      <router-link
        v-if="isAuthenticated"
        :to="`/u/${username}`"
        active-class="text-blue-600"
        @click="$emit('close')"
        class="text-gray-700 dark:text-gray-300 pl-2 hover:text-blue-600 dark:hover:text-gray-300 dark:hover:bg-slate-800 group flex gap-x-3 rounded-md py-2 text-sm leading-6 font-semibold"
      >
        My Profile
      </router-link>
      <button
        v-if="!isAuthenticated"
        @click="login"
        class="text-gray-700 dark:text-gray-300 pl-2 hover:text-blue-600 dark:hover:text-gray-300 dark:hover:bg-slate-800 group flex gap-x-3 rounded-md py-2 text-sm leading-6 font-semibold"
      >
        Log In
      </button>
      <router-link
        v-if="isAuthenticated"
        to="/logout"
        @click="logout"
        active-class="text-blue-600"
        class="text-gray-700 dark:text-gray-300 pl-2 hover:text-blue-600 dark:hover:text-gray-300 dark:hover:bg-slate-800 group flex gap-x-3 rounded-md py-2 text-sm leading-6 font-semibold"
      >
        Sign Out
      </router-link>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
nav li:hover,
nav li:active {
  color: #2563eb;
}

.list-item-icon {
  color: #9ca3af;
}
.router-link-exact-active > .list-item-icon {
  color: #2563eb;
}

nav li > .router-link-exact-active {
  color: #2563eb;
}
</style>
