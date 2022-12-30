<script lang="ts">
import { defineComponent, computed, ref, Ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import EventList from "./EventList.vue";
import TwoSeparatelyScrollingPanes from "../TwoSeparatelyScrollingPanes.vue";
import "md-editor-v3/lib/style.css";
import { useDisplay } from "vuetify/lib/framework.mjs";
import { GET_EVENTS } from "@/graphQLData/event/queries";
import getEventWhere from "@/components/event/getEventWhere";
import { SearchEventValues } from "@/types/eventTypes";
import { getFilterValuesFromParams } from "./getFilterValuesFromParams";
import ErrorBanner from "../ErrorBanner.vue";
import EventPreview from "./EventPreview.vue";

export default defineComponent({
  name: "EventListView",
  // The EventFilterBar component writes to the query
  // params, while the MapView and EventListView
  // components consume the query params.
  components: {
    ErrorBanner,
    EventList,
    EventPreview,
    TwoSeparatelyScrollingPanes,
  },
  setup(props, { emit }) {
    const route = useRoute();
    const router = useRouter();

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });
    const filterValues: Ref<SearchEventValues> = ref(
      getFilterValuesFromParams(route, channelId.value)
    );

    const resultsOrder = computed(() => {
      return filterValues.value.resultsOrder;
    });

    const eventWhere = computed(() => {
      return getEventWhere(filterValues.value, false);
    });

    const {
      error: eventError,
      result: eventResult,
      loading: eventLoading,
      refetch: refetchEvents,
      onResult: onGetEventResult,
      fetchMore,
    } = useQuery(
      GET_EVENTS,
      {
        limit: 25,
        offset: 0,
        where: eventWhere,
        resultsOrder: resultsOrder.value,
      },
      // {
      //   fetchPolicy: "network-only", // If it is not network only, the list
      //   // will not update when an event time changes in a way that affects
      //   // which search results it should be returned in.
      // }
    );

    const reachedEndOfResults = ref(false);

    const loadMore = () => {
      fetchMore({
        variables: {
          offset: eventResult.value.events.length,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult;

          return {
            ...previousResult,
            events: [...previousResult.events, ...fetchMoreResult.events],
          };
        },
      });
    };

    onGetEventResult((value) => {
      // If the preview pane is blank, fill it with the details
      // of the first result, if there is one.
      if (!value.data || value.data.events.length === 0) {
        return;
      }
      const defaultSelectedEvent = value.data.events[0];

      sendToPreview(defaultSelectedEvent.id, "");
      emit('updateLoadedEventCount', value.data.eventsAggregate?.count)
      emit('updateResultCount', value.data.events.length)
    });

    const sendToPreview = (eventId: string, eventLocationId: string) => {
      if (eventId) {
        if (!channelId.value) {
          router.push({
            name: "SitewideSearchEventPreview",
            params: {
              ...route.params,
              eventId,
            },
            hash: `#${eventLocationId ? eventLocationId : ""}`,
            query: route.query
          });
        } else {
          router.push({
            name: "SearchEventPreview",
            params: {
              eventId,
            },
            hash: `#${eventLocationId ? eventLocationId : ""}`,
            query: { ...route.query}
          });
        }
      }
    };

    const previewIsOpen = ref(false);

    const { smAndDown } = useDisplay();
    return {
      channelId,
      eventError,
      eventLoading,
      eventResult,
      eventWhere, // used for debugging with Vue developer tools
      filterValues,
      getFilterValuesFromParams,
      loadMore,
      previewIsOpen,
      reachedEndOfResults,
      refetchEvents,
      route,
      smAndDown,
    };
  },
  methods: {
    openPreview() {
      if (this.smAndDown) {
        this.previewIsOpen = true;
      }
    },
    closePreview() {
      this.previewIsOpen = false;
    },
    filterByTag(tag: string) {
      const alreadySelected = this.filterValues.selectedTags.includes(tag);

      if (alreadySelected) {
        this.filterValues.selectedTags = this.filterValues.selectedTags.filter(
          (t: string) => t !== tag
        );
      } else {
        this.filterValues.selectedTags.push(tag);
      }
    },
    filterByChannel(channel: string) {
      const alreadySelected =
        this.filterValues.selectedChannels.includes(channel);

      if (alreadySelected) {
        this.filterValues.selectedChannels =
          this.filterValues.selectedChannels.filter(
            (c: string) => c !== channel
          );
      } else {
        this.filterValues.selectedChannels.push(channel);
      }
    },
  },
  created() {
    this.$watch("$route.query", (to: any) => {
      if (this.route.query) {
        this.filterValues = getFilterValuesFromParams(this.route, this.channelId);
      }
    });
  },
});
</script>
<template>
  <div class="flex justify-center">
    
    <ErrorBanner
      class="mx-auto block"
      v-if="eventError"
      :text="eventError.message"
    />
    <TwoSeparatelyScrollingPanes
      class="block"
      v-if="eventResult && eventResult.events"
      :class="'mx-auto block'"
    >
      <template v-slot:leftpane>
        <div class="rounded max-w-5xl">
          <EventList
            id="listView"
            :class="[!channelId ? '' : '']"
            class="relative"
            :result-count="eventResult ? eventResult.eventsAggregate?.count : 0"
            :events="eventResult.events"
            :channel-id="channelId"
            :search-input="filterValues.searchInput"
            :selected-tags="filterValues.tags"
            :selected-channels="filterValues.channels"
            :show-map="false"
            @filterByTag="filterByTag"
            @filterByChannel="filterByChannel"
            @loadMore="loadMore"
            @openPreview="openPreview"
          />
          <div class="mx-auto" v-if="eventLoading">Loading...</div>
          <EventPreview
            v-else-if="smAndDown"
            :isOpen="previewIsOpen"
            @closePreview="closePreview"
          />
        </div>
      </template>
      <template v-slot:rightpane>
        <router-view></router-view>
      </template>
    </TwoSeparatelyScrollingPanes>
  </div>
</template>
