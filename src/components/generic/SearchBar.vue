<script lang="ts">
import { defineComponent, ref } from "vue";

interface Ref<T> {
  value: T;
}

export default defineComponent({
  props: {

    initialValue: {
      type: String,
      default: ""
    },
    searchPlaceholder: {
      type: String,
      default: "",
    },
    small: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const input: Ref<string> = ref(props.initialValue);
    return { input };
  },
  methods: {
    removeQuotationMarks(input: string) {
      // Prevent errors when quotation marks are added
      // to GraphQL query
      return input.split("'").join("").split('"').join("");
    },
    updateSearchInput(e: any) {
      if (this.timeout) clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.$emit("updateSearchInput",this.removeQuotationMarks(e.target.value));
      }, 500)
    },
    clear(){
      this.$emit("updateSearchInput","");
      this.input = "";
    }
  },
});
</script>
<template>
  <div class="h-10">
    <label
      for="search"
      class="sr-only"
    >Search</label>
    <div class="relative items-center w-full">
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
        <!-- Heroicon name: solid/search -->
        <svg
          class="h-4 w-4 text-gray-400"
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
        v-model="input"
        name="search"
        class="
          pl-10
          pr-3
          py-2
          rounded-lg
          leading-5
          w-full
          dark:bg-black
          dark:text-white
          placeholder-gray-500
          dark:placeholder-gray-400
          dark:border-gray-700
          focus:outline-none
          focus:ring-1
          focus:ring-blue-500
          focus:border-blue-500
          border border-gray-300
          dark:border-gray-700
          text-sm
        "
        :placeholder="searchPlaceholder"
        type="text"
        @keyup="updateSearchInput"
      >
      <div
        class="
          absolute
          inset-y-0
          right-0
          pr-3
          flex
          items-center
          cursor-pointer
        "
        @click="clear"
      >
        <i class="fa-solid fa-xmark h-4 w-4 text-gray-400" />
      </div>
    </div>
  </div>
</template>
