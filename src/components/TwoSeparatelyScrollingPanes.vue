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
        <div 
          :class="[!smAndDown ? 'constrain-height' : '']"
          class="
            lg:w-2/5 lg:overflow-y-auto
            flex flex-col flex-grow
        ">
            <slot name="leftpane"></slot>
        </div>
        <div v-if="!smAndDown" class="lg:w-3/5 lg:max-h-screen lg:overflow-y-auto">
            <slot name="rightpane"></slot>
        </div>
    </div>
</template>
<style>
.constrain-height {
    max-height: 86vh;
    height: 100% - 200px;
}
</style>
