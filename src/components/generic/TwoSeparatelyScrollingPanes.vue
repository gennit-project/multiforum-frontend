<script lang="ts">
import { defineComponent } from "vue";
import { useDisplay } from 'vuetify'

export default defineComponent({

    setup() {
        const { lgAndDown, lgAndUp } = useDisplay();

        return {
            lgAndDown,
            lgAndUp
        };
    },
    components: {
    },
});
</script>

<template>
    <div class="flex flex-row ">
        <div 
          :class="[lgAndDown ? 'w-full' : 'constrain-height min-w-left']"
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
.min-w-left {
    width: 500px;
}
.min-w-right {
    width: 800px;
}
</style>
