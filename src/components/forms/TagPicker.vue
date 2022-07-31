
<script lang="ts">
import { defineComponent, PropType } from "vue";
import Tag from "@/components/buttons/Tag.vue";

export default defineComponent({
  props: {
    initialValue: {
      type: Array as PropType<string[]>,
      default: () => {
        return [];
      },
    },
    tagOptions: {
      type: Array as PropType<string[]>,
      default: () => {
        return [];
      },
    },
  },
  setup() {},
  components: {
    Tag,
  },
  data(props) {
    const formattedTagOptions = props.tagOptions.map((tag) => {
      return {
        value: tag,
        label: tag,
      };
    });
    return {
      selectedTags: props.initialValue,
      formattedTagOptions,
    };
  },
  methods: {
    reset(){
      this.selectedTags = []
      this.$emit('setSelectedTags', this.selectedTags)
    },
    select(tag: string){
      this.selectedTags.push(tag)
      this.$emit('setSelectedTags', this.selectedTags)
    },
    deselect(tagToDeselect: string){
      this.selectedTags = this.selectedTags.filter((tag: string) => {
        return tag !== tagToDeselect
      })
      this.$emit('setSelectedTags', this.selectedTags)
    }
  }
});
</script>
<template>
  <!-- <Multiselect
    v-model="selectedTags"
    class="wide"
    :classes="{
      containerActive: 'ring-0',
      tagsSearch:
        'absolute inset-0 border-0 outline-none focus:ring-0 appearance-none p-0 text-base font-sans box-border w-full',
    }"
    mode="tags"
    @select="$emit('setSelectedTags', selectedTags)"
    @deselect="$emit('setSelectedTags', selectedTags)"
    @clear="$emit('setSelectedTags', selectedTags)"
    :placeholder="'Enter tags here'"
    :closeOnSelect="false"
    :searchable="true"
    :options="formattedTagOptions"
  /> -->
  <div class="divide-y divide-solid">
    <div class="tagpicker">
      <Tag
        :selectedTags="selectedTags"
        :key="tag"
        v-for="tag in tagOptions"
        :tag="tag"
        @select="select"
        @deselect="deselect"
      />
    </div>
    <div class="m-2 h-6">
      <button class="float-right m-1" @click="reset">Reset</button>
    </div>
  </div>
</template>

<style lang="scss">
</style>
<style>
.wide {
  min-width: 250px;
}
.tagpicker {
  max-width: 400px;
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
}
</style>
