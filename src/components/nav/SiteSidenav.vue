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
import clickOutside from "vue-click-outside";
import Avatar from "@/components/user/Avatar.vue";

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
  directives: {
    clickOutside,
  },
  components: {
    Avatar,
    CalendarIcon,
    LocationIcon,
    DiscussionIcon,
    ChannelIcon,
    XIcon,
    UserCircle,
  },
  props: {
    showDropdown: {
      type: Boolean,
      required: true,
    },
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
  methods: {
    outside() {
      this.$emit("close");
    },
  },
});
</script>
<template>
  <div v-if="showDropdown">
    <!-- Overlay (shadow) for the rest of the UI -->
    <div
      class="fixed inset-0 z-40 opacity-50 dark:text-gray-200 bg-gray-100 dark:bg-gray-900"
      @click="$emit('close')"
    />

    <div
      v-click-outside="outside"
      class="fixed left-0 top-0 z-50 flex h-full w-[275px] flex-col justify-between overflow-y-auto border-gray-300 bg-white py-2 dark:border-gray-700 dark:bg-gray-900"
    >
      <div>
        <div class="mt-2 block px-6">
          <div class="flex h-7">
            <button
              type="button"
              class="rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
              @click="$emit('close')"
            >
              <span class="sr-only">Close panel</span>
              <XIcon
                class="h-6 w-6"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <nav class="mt-16">
          <ul role="list">
            <li
              v-for="item in navigation"
              :key="item.name"
              class="px-6 dark:hover:bg-gray-700"
            >
              <router-link
                :to="item.href"
                :data-testid="`nav-link-${item.name}`"
                class="font-semibold group flex gap-x-3 rounded-md py-2 pl-2 text-sm leading-6 text-gray-700 dark:text-gray-100"
                @click="$emit('close')"
              >
                <component
                  :is="item.icon"
                  class="list-item-icon h-6 w-6 shrink-0 dark:text-blue-500"
                  aria-hidden="true"
                />
                {{ item.name }}
              </router-link>
            </li>
          </ul>
        </nav>
      </div>
      <ul class="mb-6">
        <router-link
          v-if="isAuthenticated"
          :to="`/u/${username}`"
          class="pl-6 dark:hover:bg-gray-700 font-semibold group flex items-center gap-x-3 rounded-md py-2 text-sm leading-6 text-gray-700 dark:text-gray-100  "
          @click="$emit('close')"
        >
          <Avatar :text="username" />
          My Profile
        </router-link>
        <button
          v-if="!isAuthenticated"
          class="pl-6 dark:hover:bg-gray-700 font-semibold group flex gap-x-3 rounded-md py-2 text-sm leading-6 text-gray-700 dark:text-gray-100  "
          @click="login"
        >
          Log In
        </button>
        <router-link
          v-if="isAuthenticated"
          data-testid="sign-out-link"
          to="/logout"
          class="pl-6 dark:hover:bg-gray-700 font-semibold group flex gap-x-3 rounded-md py-2 text-sm leading-6 text-gray-700 dark:text-gray-100"
          @click="logout"
        >
          Sign Out
        </router-link>
      </ul>
    </div>
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
