<script lang="ts">
import ChannelTabs from "./ChannelTabs.vue";
// import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import { useRoute } from "vue-router";
import { defineComponent, computed, ref } from "vue";
import { useDisplay } from "vuetify";

export default defineComponent({
  name: "ChannelComponent",
  components: {
    // ChannelIcon,
    ChannelTabs,
  },
  setup() {
    const route = ref(useRoute());

    const channelId = computed(() => {
      return route.value.params.channelId;
    });

    const discussionId = computed(() => {
      return route.value.params.discussionId;
    });

    const eventId = computed(() => {
      return route.value.params.eventId;
    });
    const { lgAndDown, lgAndUp, mdAndUp } = useDisplay();

    return {
      channelId,
      discussionId,
      eventId,
      route,
      lgAndDown,

      lgAndUp,
      mdAndUp,
    };
  },
  created() {
    this.$watch("$route", (newRoute: any) => {
      this.route = newRoute;
    });
  },
});
</script>

<template>
  <div class="shadow-md bg-gray-100">
    <div class="flex">
      <article
        class="relative z-0 flex-1 overflow-y-auto focus:outline-none xl:order-last"
      >
        <div class="block p-2 mx-auto">
          <div
            class="grid grid-cols-1 items-start gap-4 lg:grid-cols-4 lg:gap-8"
          >
            <div class="grid grid-cols-1 gap-4 h-full">
              <section aria-labelledby="section-2-title h-full">
                <div class="overflow-hidden rounded-lg bg-white shadow pb-4 h-full">
                  <div
                    v-if="mdAndUp"
                    class="h-24 w-full object-cover user-background"
                    alt="background pattern"
                  ></div>
                  <div class="lg:-mt-8">
                    <div class="flex space-x-2">
                      <div
                        class="h-24 w-24 rounded-full ring-4 ring-white dark:ring-slate-900"
                        id="channelAvatar"
                      ></div>
                      <div>
                        <h1 class="text-2xl no-underline mt-12">
                          {{ channelId }}
                        </h1>
                        <!-- <h2 class="text-gray-500">secondary name</h2> -->
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div class="grid grid-cols-1 gap-4 lg:col-span-3 overflow-hidden rounded-lg bg-white shadow">
              <div class="border-b-2 dark:border-gray-700">
                <section aria-labelledby="section-1-title">
                  <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div class="block mt-4">
                      <ChannelTabs class="block" :route="route" />
                    </div>
                  </div>
                </section>
              </div>
              <div class="overflow-hidden">
                <div >
                  <router-view></router-view>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
<style>
#channelAvatar {
  background-color: #4474c0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='152' height='152' viewBox='0 0 152 152'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='temple' fill='%23efefef' fill-opacity='0.4'%3E%3Cpath d='M152 150v2H0v-2h28v-8H8v-20H0v-2h8V80h42v20h20v42H30v8h90v-8H80v-42h20V80h42v40h8V30h-8v40h-42V50H80V8h40V0h2v8h20v20h8V0h2v150zm-2 0v-28h-8v20h-20v8h28zM82 30v18h18V30H82zm20 18h20v20h18V30h-20V10H82v18h20v20zm0 2v18h18V50h-18zm20-22h18V10h-18v18zm-54 92v-18H50v18h18zm-20-18H28V82H10v38h20v20h38v-18H48v-20zm0-2V82H30v18h18zm-20 22H10v18h18v-18zm54 0v18h38v-20h20V82h-18v20h-20v20H82zm18-20H82v18h18v-18zm2-2h18V82h-18v18zm20 40v-18h18v18h-18zM30 0h-2v8H8v20H0v2h8v40h42V50h20V8H30V0zm20 48h18V30H50v18zm18-20H48v20H28v20H10V30h20V10h38v18zM30 50h18v18H30V50zm-2-40H10v18h18V10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>
