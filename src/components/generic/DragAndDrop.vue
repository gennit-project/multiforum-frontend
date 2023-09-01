<script>
import { ref } from "vue";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";

export default {
  setup() {
    const editor = useEditor({
      extensions: [StarterKit],
      content: "<p>Hello World! 🌍️</p>",
    });

    const handleFileUpload = (event) => {
      const fileList = event.dataTransfer
        ? event.dataTransfer.files
        : event.target.files;
      const reader = new FileReader();

      reader.onload = (event) => {
        // Replace this with your upload logic, for this example,
        // I will add it directly into the editor content as base64 encoded image
        editor.chain().focus().setImage({ src: event.target.result }).run();
      };

      reader.readAsDataURL(fileList[0]);
    };

    return {
      editor,
      handleFileUpload,
    };
  },
};
</script>
<template>
  <div @dragover.prevent @drop.prevent="handleFileUpload($event)">
    <EditorContent :editor="editor" />
    <input type="file" @change="handleFileUpload($event)" />
  </div>
</template>
