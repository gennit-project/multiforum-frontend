<script lang="ts">
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";
import {
  CalendarIcon,
  ChatAlt2Icon,
  UserGroupIcon
} from "@heroicons/vue/solid";

export default defineComponent({
  name: "channelSidenav",
  setup() {
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId;
    });

    return {
      channelId,
      tabRoutes: {
        overview: `/c/${channelId.value}/`,
        discussions: `/c/${channelId.value}/discussions`,
        events: `/c/${channelId.value}/events`,
      },
    };
  },
  components: {
      CalendarIcon,
      ChatAlt2Icon,
      UserGroupIcon
  },
  data() {
    return {
      selectedTab: "overview",
    };
  },
  methods: {
    redirect(e: any) {
      const selectedTab = e.target.value;
      this.$router.push(this.tabRoutes[selectedTab]);
    },
  },
});
</script>

<template>
  <div >
    <div class="sm:hidden px-8">
      <label for="tabs" class="sr-only">Select a tab</label>
      <!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
      <select
        v-model="selectedTab"
        @change="redirect($event)"
        id="tabs"
        name="tabs"
        class="
          block
          w-full
          focus:ring-indigo-500 focus:border-indigo-500
          border-gray-300
          rounded-md
          mb-4
        "
      >
        <option value="overview">Overview</option>
        <option value="discussions">Discussions</option>
        <option value="events">Events</option>
      </select>
    </div>
    <div class="hidden sm:block px-10">
      
        <nav class="-mb-px text-lg max-w-7xl space-x-8" aria-label="Tabs">
          <!-- Current: "border-indigo-500 text-indigo-600", Default: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" -->
          <router-link
            :to="tabRoutes.overview"
            class="
              border-transparent
              text-gray-500
              hover:text-indigo-600 hover:border-indigo-500
              group
              inline-flex
              items-center
              py-4
              px-1
              border-b-2
              font-medium
              text-sm
            "
            exact-active-class="border-indigo-500 text-indigo-600"
          >
            <!--
            Heroicon name: solid/user

            Current: "text-indigo-500", Default: "text-gray-400 group-hover:text-gray-500"
          -->
            <svg
              class="
                -ml-0.5
                mr-2
                h-5
                w-5
              "
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <UserGroupIcon/>
            </svg>
            <span>Overview</span>
          </router-link>

          <router-link
            :to="tabRoutes.discussions"
            class="
              border-transparent
              text-gray-500
              hover:text-indigo-600 hover:border-indigo-500
              group
              inline-flex
              items-center
              py-4
              px-1
              border-b-2
              font-medium
              text-sm
            "
            active-class="border-indigo-500 text-indigo-600"
          >
            <!-- Heroicon name: solid/office-building -->
            <svg
              class="
                -ml-0.5
                mr-2
                h-5
                w-5
              "
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <ChatAlt2Icon/>
            </svg>
            <span>Discussions</span>
          </router-link>

          <router-link
            :to="tabRoutes.events"
            class="
              border-transparent
              text-gray-500
              hover:text-indigo-600 hover:border-indigo-500
              group
              inline-flex
              items-center
              py-4
              px-1
              border-b-2
              font-medium
              text-sm
            "
            active-class="border-indigo-500 text-indigo-600"
            aria-current="page"
          >
            <!-- Heroicon name: solid/users -->
            <svg
              class="-ml-0.5 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <CalendarIcon/>
            </svg>
            <span>Events</span>
          </router-link>
        </nav>
        
    </div>
    <div class="border-b border-gray-200 width-full"></div>
  </div>
</template>
