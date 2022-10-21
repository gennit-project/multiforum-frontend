<script lang="ts">
import { defineComponent } from "vue";
import { useDisplay } from 'vuetify'

export default defineComponent({
    setup() {
        const { smAndDown } = useDisplay();

        return {
            smAndDown
        };
    },
    components: {
    },
});
</script>

<template>
    <div class="lg:flex lg:flex-row">
        <div class="
          lg:w-2/5 lg:h-full lg:max-h-screen lg:overflow-y-auto
          flex flex-col flex-grow
        ">
            <slot name="leftpane"></slot>
        </div>
        <div v-if="!smAndDown" class="lg:w-3/5 lg:max-h-screen lg:overflow-y-auto">
            <slot name="rightpane"></slot>
        </div>
    </div>
</template>
