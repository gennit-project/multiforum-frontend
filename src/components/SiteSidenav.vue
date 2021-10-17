<script setup lang="ts">

</script>

<template>
  <div
    class="
      sidebar
      bg-blue-800
      text-blue-100
      space-y-6
      py-7
      px-2
      absolute
      inset-y-0
      left-0
      transform
      -translate-x-full
      lg:relative lg:translate-x-0
    "
  >
    <a href="#" class="text-white flex items-center space-x-2 px-4">
      <svg
        class="w-4 h-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
      </svg>
      <span class="text-1xl font-extrabold">Gennit</span>
    </a>

    <nav>
      <router-link
        to="/"
        class="
          block
          py-2.5
          px-4
          rounded
          hover:bg-blue-700 hover:text-white
        "
        active-class="bg-blue-700 text-white"
      >
        Events
      </router-link>
      <router-link
        to="/discussions"
        class="
          block
          py-2.5
          px-4
          rounded
          hover:bg-blue-700 hover:text-white
        "
        active-class="bg-blue-700 text-white"
      >
        Discussions
      </router-link>
      <router-link
        to="/channels"
        class="
          block
          py-2.5
          px-4
          rounded
          hover:bg-blue-700 hover:text-white
        "
        active-class="bg-blue-700 text-white"
      >
        Channels
      </router-link>
      <router-link
        to="/c/cats"
        class="
          block
          py-2.5
          px-4
          rounded
          hover:bg-blue-700 hover:text-white
        "
        active-class="bg-blue-700 text-white"
      >
        /c/cats
      </router-link>
      <router-link
        to="/c/dogs"
        class="
          block
          py-2.5
          px-4
          rounded
          hover:bg-blue-700 hover:text-white
        "
        active-class="bg-blue-700 text-white"
      >
        /c/dogs
      </router-link>
       <router-link
        to="/u/1"
        class="
          block
          py-2.5
          px-4
          rounded
          hover:bg-blue-700 hover:text-white
        "
        active-class="bg-blue-700 text-white"
      >
        User Profile
      </router-link>
    </nav>
  </div>
</template>
