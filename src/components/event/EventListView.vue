<script lang="ts">
import { defineComponent, computed, ref, Ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import EventList from "./EventList.vue";
import TwoSeparatelyScrollingPanes from "../generic/TwoSeparatelyScrollingPanes.vue";
import "md-editor-v3/lib/style.css";
import { useDisplay } from "vuetify/lib/framework.mjs";
import { GET_EVENTS } from "@/graphQLData/event/queries";
import getEventWhere from "@/components/event/getEventWhere";
import { SearchEventValues } from "@/types/eventTypes";
import { getFilterValuesFromParams } from "./getFilterValuesFromParams";
import ErrorBanner from "../generic/ErrorBanner.vue";
import EventPreview from "./EventPreview.vue";
import { timeShortcutValues } from "./eventSearchOptions";
import { chronologicalOrder, reverseChronologicalOrder } from "./filterStrings";

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
    console.log('event list view route name ', route.name)

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
      if (filterValues.value.timeShortcut === timeShortcutValues.PAST_EVENTS) {
        return reverseChronologicalOrder;
      }
      return chronologicalOrder;
    });

    const eventWhere = computed(() => {
      return getEventWhere(filterValues.value, false, channelId.value);
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
        resultsOrder: resultsOrder,
      }
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

    const selectedEventId = ref('')

    onGetEventResult((value) => {
      console.log('on get event result ', {
              resultsOrder,
              eventWhere
            })
      // If the preview pane is blank, fill it with the details
      // of the first result, if there is one.
      if (!value.data || value.data.events.length === 0) {
        return;
      }
      selectedEventId.value = value.data.events[0]?.id;

      if (selectedEventId.value && value.data.events.length > 0) {
        sendToPreview(selectedEventId.value);
      }
      
      emit("updateLoadedEventCount", value.data.events.length);
      emit("updateResultCount", value.data.eventsAggregate?.count);
    });

    const sendToPreview = (eventId: string, eventLocationId: string = '') => {
      // if (!route.params.eventId) {
        if (!channelId.value) {
          router.push({
            name: "SitewideSearchEventPreview",
            params: {
              ...route.params,
              eventId,
            },
            hash: `#${eventLocationId}`,
            query: {...route.query},
          });
        } else {
          router.push({
            name: "SearchEventPreview",
            params: {
              eventId,
            },
            hash: `#${eventLocationId}`,
            query: { ...route.query },
          });
        }
      // }
    };

    const previewIsOpen = ref(false);

    const { smAndDown } = useDisplay();
    return {
      channelId,
      eventId: selectedEventId,
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
    updateFilters(params: SearchEventValues) {
      const existingQuery = this.$route.query;
      // Updating the URL params causes the events
      // to be refetched by the EventListView
      // and MapView components
      this.$router.replace({
        query: {
          ...existingQuery,
          ...params,
        },
      });
    },
    openPreview() {
      if (this.smAndDown) {
        this.previewIsOpen = true;
      }
    },
    closePreview() {
      this.previewIsOpen = false;
    },
    filterByTag(tag: string) {
      const alreadySelected = this.filterValues.tags.includes(tag);

      if (alreadySelected) {
        this.filterValues.tags = this.filterValues.tags.filter(
          (t: string) => t !== tag
        );
      } else {
        this.filterValues.tags.push(tag);
      }
      this.updateFilters({ tags: tag });
    },
    filterByChannel(channel: string) {
      const alreadySelected =
        this.filterValues.channels.includes(channel);

      if (alreadySelected) {
        this.filterValues.channels =
          this.filterValues.channels.filter(
            (c: string) => c !== channel
          );
      } else {
        this.filterValues.channels.push(channel);
      }
    },
  },
  created() {
    this.$watch("$route.query", () => {
      if (this.route.query) {
        this.filterValues = getFilterValuesFromParams(
          this.route,
          this.channelId
        );
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
    <p v-else-if="eventLoading">Loading...</p>
    <TwoSeparatelyScrollingPanes
      class="block"
      v-else-if="eventResult"
    >
      <template v-slot:leftpane>
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
            v-if="smAndDown && eventId"
            :isOpen="previewIsOpen"
            @closePreview="closePreview"
          />
      </template>
      <template v-slot:rightpane>
        <router-view></router-view>
      </template>
    </TwoSeparatelyScrollingPanes>
  </div>
</template>
