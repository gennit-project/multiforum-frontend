<script>
import { defineComponent } from "vue";

export default defineComponent({
  setup() {},
});
</script>
<template>
  <div
    class="text-wrap h-16 w-full items-center justify-center bg-gray-800 text-white p-4"
  >
    This project is in alpha. I have hosted it publicly so that others can help me test the app. If you have feedback or technical problems, please open an issue in the
    <a
      class="ml-1 text-blue-500 underline"
      target="_blank"
      href="https://github.com/gennit-project/multiforum-frontend/issues"
    >GitHub repo</a>, or email me at
    <a
      class="ml-1 text-blue-500"
      href="mailto:gennitdev@gmail.com"
    >gennitdev@gmail.com</a>.
  </div>
</template>

<style scoped>
.text-wrap {
  word-wrap: break-word;
}
</style>
