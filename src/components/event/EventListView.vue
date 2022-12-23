<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import EventList from "./EventList.vue";
import TwoSeparatelyScrollingPanes from "../TwoSeparatelyScrollingPanes.vue";
import "md-editor-v3/lib/style.css";
import { useDisplay } from "vuetify/lib/framework.mjs";
import { GET_EVENTS } from "@/graphQLData/event/queries";
import getEventWhere from '@/components/event/getEventWhere'

export default defineComponent({
  name: "EventListView",
  // The SearchEvent component writes to the query
  // params, while the MapView, EventListView, and EventFilterBar
  // components consume the query params.
  components: {
    EventList,
    TwoSeparatelyScrollingPanes,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    const resultsOrder = computed(() => {
      // Keep track of results order separately so that query
      // will be refetched when it changes. Otherwise the query
      // would only be refetched when a value inside the eventWhere
      // object is changed.
      return resultsOrder;
    });

    const eventWhere = computed(() => {
        return getEventWhere(filterValues, false)
    })

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
      },
      {
        fetchPolicy: "network-only", // If it is not network only, the list
        // will not update when an event time changes in a way that affects
        // which search results it should be returned in.
      }
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
    });

    const sendToPreview = (eventId: string, eventLocationId: string) => {
      if (eventId) {
        if (!channelId.value) {
          router.push({
            name: "SitewideSearchEventPreview",
            params: {
              eventId,
            },
            hash: `#${eventLocationId ? eventLocationId : ""}`,
          });
        } else {
          router.push({
            name: "SearchEventPreview",
            params: {
              eventId,
            },
            hash: `#${eventLocationId ? eventLocationId : ""}`,
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
      loadMore,
      previewIsOpen,
      reachedEndOfResults,
      refetchEvents,
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
        this.$watch(
        () => this.$route.params,
        (toParams, previousParams) => {
            // react to route changes...
        }
        )
    },
});
</script>
<template>
  <div>
    <div class="mx-auto" v-if="eventLoading">Loading...</div>
    <ErrorBanner
      class="mx-auto block"
      v-else-if="eventError"
      :text="eventError.message"
    />
    <TwoSeparatelyScrollingPanes v-if="eventResult && eventResult.events" :class="'mx-auto block'">
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
            :selected-tags="filterValues.selectedTags"
            :selected-channels="filterValues.selectedChannels"
            :show-map="false"
            @filterByTag="filterByTag"
            @filterByChannel="filterByChannel"
            @loadMore="loadMore"
            @openPreview="openPreview"
          />
          <EventPreview
            v-if="smAndDown"
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
  P
</template>
