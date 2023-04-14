<script lang="ts">
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";
import { GET_USER } from "@/graphQLData/user/queries";
import { GET_LOCAL_MOD_PROFILE_NAME } from "@/graphQLData/user/queries";
import { useQuery } from "@vue/apollo-composable";
import ErrorBanner from "../generic/ErrorBanner.vue";
import ProfileAvatar from "./ProfileAvatar.vue";
import { relativeTime } from "@/utils/dateTimeUtils";
import TabButton from "@/components/generic/TabButton.vue";

export default defineComponent({
  components: {
    TabButton,
    ErrorBanner,
    ProfileAvatar,
  },
  setup() {
    const route = useRoute();

    const {
      result: localModProfileNameResult,
      loading: localModProfileNameLoading,
      error: localModProfileNameError,
    } = useQuery(GET_LOCAL_MOD_PROFILE_NAME);

    const loggedInUserModName = computed(() => {
      if (localModProfileNameLoading.value || localModProfileNameError.value) {
        return "";
      }
      return localModProfileNameResult.value.modProfileName;
    });

    const username = computed(() => {
      if (typeof route.params.username === "string") {
        return route.params.username;
      }
      return "";
    });

    const { result, loading, error } = useQuery(GET_USER, () => ({
      username: username.value,
    }));

    const links = computed(() => {
      return [
        {
          label: username.value,
          path: `u/${username.value}`,
        },
      ];
    });

    const user = computed(() => {
      if (loading.value || error.value) {
        return null;
      }
      if (result.value && result.value.users.length > 0) {
        return result.value.users[0];
      }
      return null;
    });

    return {
      error,
      links,
      loading,
      loggedInUserModName,
      relativeTime,
      result,
      route,
      tabs: [
        { name: "Comments", href: "comments", current: true },
        { name: "Discussions", href: "discussions", current: false },
        { name: "Events", href: "events", current: false },
        // { name: 'Calendar', href: '#', current: false },
        // { name: 'Recognition', href: '#', current: false },
      ],
      user,
      username,
    };
  },
});
</script>

<template>
  <div>
    <div v-if="loading">Loading...</div>
    <ErrorBanner :text="error.message" v-else-if="error" :error="error" />
    <main v-else>
      <article
        class="relative z-0 flex-1 overflow-y-auto focus:outline-none xl:order-last"
      >
        <div>
          <div>
            <div
              class="h-32 w-full object-cover lg:h-48 user-background"
              alt="background pattern"
            />
          </div>
          <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div class="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
              <div class="flex">
                <img
                  v-if="user.picture"
                  class="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                  :src="user.picture"
                  alt="User profile picture"
                />
                <ProfileAvatar
                  v-else
                  :user="user"
                  class="h-24 w-24 ring-4 ring-white sm:h-32 sm:w-32"
                />
              </div>
              <div
                class="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1"
              >
                <div class="mt-6 min-w-0 flex-1 sm:hidden 2xl:block">
                  <h1
                    class="truncate text-2xl sm:mt-10 mb-2 font-bold text-gray-900"
                  >
                    {{ username }}
                  </h1>
                  {{ `Created ${relativeTime(user.createdAt)}` }}
                </div>
              </div>
            </div>
            <div class="mt-6 hidden min-w-0 flex-1 sm:block 2xl:hidden">
              <h1
                class="truncate text-2xl mb-2 sm:mt-10 font-bold text-gray-900"
              >
                {{ username }}
              </h1>
              {{ `Joined ${relativeTime(user.createdAt)}` }}
            </div>
            <ul class="m-4 list-disc">
              <li>
                {{ `${user.CommentsAggregate.count} comments` }}
              </li>
              <li>
                {{ `${user.DiscussionsAggregate.count} discussions` }}
              </li>
              <li>
                {{ `${user.EventsAggregate.count} events` }}
              </li>
            </ul>
            <router-link
              class="underline text-sm text-gray-500"
              v-if="loggedInUserModName"
              :to="`/mod/${loggedInUserModName}`"
              >Go to mod profile</router-link
            >
          </div>
        </div>

        <!-- Tabs -->
        <div class="mt-6 sm:mt-2 2xl:mt-5  ">
          <div class="border-b border-gray-200 bg-gray-100">
            <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <nav
                class="-mb-px text-lg max-w-7xl space-x-8"
                aria-label="Tabs"
              >
                <TabButton
                  v-for="tab in tabs"
                  :key="tab.name"
                  :to="`/u/${username}/${tab.href}`"
                  :label="tab.name"
                  :is-active="route.path.includes(tab.name.toLowerCase())"
                />
              </nav>
            </div>
          </div>
          <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-12">
            <router-view></router-view>
          </div>
        </div>
      </article>
    </main>
  </div>
</template>
<style>
.user-background {
  background-color: #4474c0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='152' height='152' viewBox='0 0 152 152'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='temple' fill='%23efefef' fill-opacity='0.4'%3E%3Cpath d='M152 150v2H0v-2h28v-8H8v-20H0v-2h8V80h42v20h20v42H30v8h90v-8H80v-42h20V80h42v40h8V30h-8v40h-42V50H80V8h40V0h2v8h20v20h8V0h2v150zm-2 0v-28h-8v20h-20v8h28zM82 30v18h18V30H82zm20 18h20v20h18V30h-20V10H82v18h20v20zm0 2v18h18V50h-18zm20-22h18V10h-18v18zm-54 92v-18H50v18h18zm-20-18H28V82H10v38h20v20h38v-18H48v-20zm0-2V82H30v18h18zm-20 22H10v18h18v-18zm54 0v18h38v-20h20V82h-18v20h-20v20H82zm18-20H82v18h18v-18zm2-2h18V82h-18v18zm20 40v-18h18v18h-18zM30 0h-2v8H8v20H0v2h8v40h42V50h20V8H30V0zm20 48h18V30H50v18zm18-20H48v20H28v20H10V30h20V10h38v18zM30 50h18v18H30V50zm-2-40H10v18h18V10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>
