<script lang="ts">
import { defineComponent } from 'vue';
import TextEditor from '@/components/forms/TextEditor.vue'

export default defineComponent({
    name: "CreateEventForm",
    components: { TextEditor },
    setup(){}
})
</script>

<template>
<div>Create event</div>
<TextEditor/>
</template>