<script lang="ts">
import { defineComponent, PropType, computed, ref, Ref } from "vue";
import { GET_TAGS } from "@/graphQLData/tag/queries";
import { useQuery } from "@vue/apollo-composable";
import { Tag } from "@/__generated__/graphql";
import clickOutside from "vue-click-outside";
import SearchBar from "@/components/generic/SearchBar.vue";

export default defineComponent({
  components: {
    SearchBar,
  },
  directives: {
    clickOutside,
  },
  props: {
    hideSelected: {
      type: Boolean,
      default: false,
    },
    selectedTags: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    description: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const searchInput: Ref<string> = ref("");

    const searchInputComputed = computed(() => {
      return searchInput.value;
    });

    const {
      loading: tagsLoading,
      error: tagsError,
      result: tagsResult,
    } = useQuery(GET_TAGS, {
      where: {
        text_CONTAINS: searchInputComputed,
      },
    });

    const isDropdownOpen = ref(false);

    const tagOptions = computed(() => {
      if (!tagsResult.value || !tagsResult.value.tags) {
        return [];
      }
      return tagsResult.value.tags.map((tag: Tag) => ({
        text: tag.text,
      }));
    });

    const selected = ref([...props.selectedTags]);

    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value;
    };

    const toggleSelection = (tag: string) => {
      const index = selected.value.indexOf(tag);
      if (index === -1) {
        selected.value.push(tag);
      } else {
        selected.value.splice(index, 1);
      }
      emit("setSelectedTags", selected.value);
    };

    return {
      tagsError,
      tagsLoading,
      tagOptions,
      isDropdownOpen,
      toggleDropdown,
      searchInput,
      selected,
      toggleSelection,
    };
  },
  watch: {
    selectedTags(newVal) {
      this.selected = [...newVal];
    },
  },
  methods: {
    updateSearchResult(input: string) {
      this.searchInput = input;
    },
    outside() {
      this.isDropdownOpen = false;
    },
    removeSelection(tag: string) {
      this.selected = this.selected.filter((c: string) => c !== tag);
      this.$emit("setSelectedTags", this.selected);
    },
  },
});
</script>

<template>
  <div>
    <div>
      <div
        v-if="description"
        class="py-1 text-sm dark:text-gray-300"
      >
        {{ description }}
      </div>
      <div class="relative">
        <div
          class="flex min-h-12 w-full cursor-pointer flex-wrap items-center rounded-lg border px-4 py-2 text-left dark:border-gray-700 dark:bg-gray-700"
          @click="toggleDropdown"
        >
          <div
            v-for="(tag, index) in selected"
            :key="index"
            class="mr-2 mt-1 flex items-center rounded-full bg-blue-100 px-2 text-blue-700"
            @click="removeSelection(tag)"
          >
            <span>{{ tag }}</span>
            <span
              class="ml-1 cursor-pointer"
              @click.stop="removeSelection(tag)"
            >
              &times;
            </span>
          </div>
        </div>
        <div
          v-if="isDropdownOpen"
          v-click-outside="outside"
          class="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
        >
          <SearchBar
            class="mr-2 w-full align-middle"
            :auto-focus="true"
            :search-placeholder="'Search tags'"
            :initial-value="searchInput"
            @keydown.enter.prevent
            @updateSearchInput="updateSearchResult"
          />
          <div v-if="tagsLoading">
            Loading...
          </div>
          <div v-else-if="tagsError">
            <div
              v-for="(error, i) of tagsError?.graphQLErrors"
              :key="i"
            >
              {{ error.message }}
            </div>
          </div>
          <div
            v-for="tag in tagOptions"
            :key="tag.text"
            class="border-b p-1 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <label class="flex cursor-pointer items-center space-x-3 p-2">
              <input
                type="checkbox"
                :value="tag.text"
                :checked="selected.includes(tag.text)"
                class="form-checkbox"
                @change="toggleSelection(tag.text)"
              >
              <div class="flex items-center space-x-2">
                <div class="flex-col">
                  <span class="font-bold">{{ tag.text }}</span>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
