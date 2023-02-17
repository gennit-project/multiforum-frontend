<script lang="ts">
import { defineComponent } from "vue";
import { useDisplay } from 'vuetify'

export default defineComponent({

    setup() {
        const { lgAndDown, lgAndUp, mdAndDown, mdAndUp, xlAndUp } = useDisplay();

        return {
            lgAndDown,
            lgAndUp,
            mdAndDown,
            mdAndUp,
            xlAndUp,
        };
    },
    components: {
    },
});
</script>

<template>
    <div class="flex flex-row ">
        <div 
          :class="[
            lgAndUp ? '' : 'constrain-height', 
            lgAndUp ? 'min-w-left-lg' : 'min-w-left-md', 
            mdAndDown ? 'w-full' : ''
            ]
          "
          class="
            lg:overflow-y-auto
            
        ">
            <slot name="leftpane"></slot>
        </div>
        <div v-if="lgAndUp" class="lg:max-h-screen lg:overflow-y-auto min-w-right">
            <slot name="rightpane"></slot>
        </div>
    </div>
</template>
<style>
.constrain-height {
    max-height: 86vh;
    height: 100% - 200px;
}
.min-w-left-lg {
    width: 500px;
}
.min-w-left-md {
    width: 300px;
}
.min-w-right {
    width: 700px;
}
</style>
