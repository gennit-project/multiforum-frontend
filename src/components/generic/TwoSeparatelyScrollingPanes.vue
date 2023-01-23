<script lang="ts">
import { defineComponent } from "vue";
import { useDisplay } from 'vuetify'

export default defineComponent({

    setup() {
        const { mdAndDown } = useDisplay();

        return {
            mdAndDown
        };
    },
    components: {
    },
});
</script>

<template>
    <div class="flex flex-row ">
        <div 
          :class="[!mdAndDown ? 'constrain-height' : '']"
          class="
            lg:overflow-y-auto
            min-w-left
        ">
            <slot name="leftpane"></slot>
        </div>
        <div v-if="!mdAndDown" class="lg:max-h-screen lg:overflow-y-auto min-w-right">
            <slot name="rightpane"></slot>
        </div>
    </div>
</template>
<style>
.constrain-height {
    max-height: 86vh;
    height: 100% - 200px;
}
.min-w-left {
    width: 500px;
}
.min-w-right {
    width: 800px;
}
</style>
