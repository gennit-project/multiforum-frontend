<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {},
  data() {
    return {
      showUserProfileDropdown: false,
      showMobileDropdown: false,
    };
  },
  methods: {
    toggleUserProfileDropdown() {
      this.showUserProfileDropdown = !this.showUserProfileDropdown;
    },
  },
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
    <div class="relative flex items-center justify-between h-16">
      <div class="flex items-center px-2 lg:px-0">
      gennit
        <!-- <div class="flex-shrink-0">
          <img
            class="block lg:hidden h-8 w-auto"
            src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg"
            alt="Workflow"
          />
          <img
            class="hidden lg:block h-8 w-auto"
            src="https://tailwindui.com/img/logos/workflow-logo-indigo-500-mark-white-text.svg"
            alt="Workflow"
          />
        </div> -->
        <div class="hidden lg:block lg:ml-6">
          <div class="flex space-x-4">
            <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
            <router-link
              to="/"
              class="
                inline-flex
                items-center
                text-gray-300
                hover:bg-gray-700 hover:text-white
                px-3
                py-2
                rounded-md
                text-sm
                font-medium
              "
              active-class="
                inline-flex
                items-center
                bg-gray-900
                text-white
                px-3
                py-2
                rounded-md
                text-sm
                font-medium
              "
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                class="-ml-0.5 mr-2 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                /></svg
              >Events</router-link
            >
            <router-link
              to="/discussions"
              class="
                inline-flex
                items-center
                text-gray-300
                hover:bg-gray-700 hover:text-white
                px-3
                py-2
                rounded-md
                text-sm
                font-medium
              "
              active-class="
                inline-flex
                items-center
                bg-gray-900
                text-white
                px-3
                py-2
                rounded-md
                text-sm
                font-medium
              "
              >
              <svg xmlns="http://www.w3.org/2000/svg" class="-ml-0.5 mr-2 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              Discussions</router-link
            >
            <router-link
              to="/channels"
              class="
                inline-flex
                items-center
                text-gray-300
                hover:bg-gray-700 hover:text-white
                px-3
                py-2
                rounded-md
                text-sm
                font-medium
              "
              active-class="
                inline-flex
                items-center
                bg-gray-900
                text-white
                px-3
                py-2
                rounded-md
                text-sm
                font-medium
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="-ml-0.5 mr-2 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Channels
            </router-link>
            <router-link
              to="/feeds"
              class="
                inline-flex
                items-center
                text-gray-300
                hover:bg-gray-700 hover:text-white
                px-3
                py-2
                rounded-md
                text-sm
                font-medium
              "
              active-class="
                inline-flex
                items-center
                bg-gray-900
                text-white
                px-3
                py-2
                rounded-md
                text-sm
                font-medium
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="-ml-0.5 mr-2 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z"
                />
              </svg>
              Feeds</router-link
            >
          </div>
        </div>
      </div>
      <!-- <div class="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
        <div class="max-w-lg w-full lg:max-w-xs">
          <label for="search" class="sr-only">Search</label>
          <div class="relative">
            <div
              class="
                absolute
                inset-y-0
                left-0
                pl-3
                flex
                items-center
                pointer-events-none
              "
            >
              <svg
                class="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <input
              id="search"
              name="search"
              class="
                block
                w-full
                pl-10
                pr-3
                py-2
                border border-transparent
                rounded-md
                leading-5
                bg-gray-700
                text-gray-300
                placeholder-gray-400
                focus:outline-none
                focus:bg-white
                focus:border-white
                focus:ring-white
                focus:text-gray-900
                sm:text-sm
              "
              placeholder="Search"
              type="search"
            />
          </div>
        </div>
      </div> -->
      <div class="flex lg:hidden">
        <!-- Mobile menu button -->
        <button
          @click="$emit('toggleMobileDropdown')"
          type="button"
          class="
            inline-flex
            items-center
            justify-center
            p-2
            rounded-md
            text-gray-400
            hover:text-white hover:bg-gray-700
            focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white
          "
          aria-controls="mobile-menu"
          aria-expanded="false"
        >
          <span class="sr-only">Open main menu</span>
          <!--
            Icon when menu is closed.

            Heroicon name: outline/menu

            Menu open: "hidden", Menu closed: "block"
          -->
          <svg
            class="block h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <!--
            Icon when menu is open.

            Heroicon name: outline/x

            Menu open: "block", Menu closed: "hidden"
          -->
          <svg
            class="hidden h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <!-- <div class="hidden lg:block lg:ml-4">
        <div class="flex items-center">
          <button
            type="button"
            class="
              flex-shrink-0
              bg-gray-800
              p-1
              rounded-full
              text-gray-400
              hover:text-white
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-offset-gray-800
              focus:ring-white
            "
          >
            <span class="sr-only">View notifications</span>
            <svg
              class="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          <div class="ml-4 relative flex-shrink-0">
            <div @click="toggleUserProfileDropdown">
              <button
                type="button"
                class="
                  bg-gray-800
                  rounded-full
                  flex
                  text-sm text-white
                  focus:outline-none
                  focus:ring-2
                  focus:ring-offset-2
                  focus:ring-offset-gray-800
                  focus:ring-white
                "
                id="user-menu-button"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <span class="sr-only">Open user menu</span>
                <img
                  class="h-8 w-8 rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
              </button>
            </div> -->

            <!--
              Dropdown menu, show/hide based on menu state.

              Entering: "transition ease-out duration-100"
                From: "transform opacity-0 scale-95"
                To: "transform opacity-100 scale-100"
              Leaving: "transition ease-in duration-75"
                From: "transform opacity-100 scale-100"
                To: "transform opacity-0 scale-95"
            -->
            <!-- <div
              v-if="showUserProfileDropdown"
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
                to="/u/1"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                tabindex="-1"
                id="user-menu-item-0"
                >Your Profile</router-link
              >
              <router-link
                to="settings"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                tabindex="-1"
                id="user-menu-item-1"
                >Settings</router-link
              >
              <router-link
                to="signout"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                tabindex="-1"
                id="user-menu-item-2"
                >Sign out</router-link
              >
            </div>
          </div>
        </div>
      </div> -->
    </div>
  </div>
</template>
