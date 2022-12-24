import { createRouter, createWebHistory } from "vue-router";
import Channel from "./components/channel/Channel.vue";
import UserProfile from "./components/UserProfile.vue";
import SearchChannels from "./components/channel/SearchChannels.vue";
import EventDetail from "./components/event/EventDetail.vue";
import SearchEvents from "./components/event/SearchEvents.vue";
import Feed from "./components/feed/Feed.vue";
import SearchFeeds from "./components/feed/SearchFeeds.vue";
import DiscussionTab from "./components/discussion/DiscussionTab.vue";
import EventTab from "./components/event/EventTab.vue";
import DiscussionDetail from "./components/discussion/DiscussionDetail.vue";
import SearchDiscussions from "./components/discussion/SearchDiscussions.vue";
import About from "./components/channel/About.vue";
import SiteSettings from "./components/SiteSettings.vue";
import CreateEvent from "@/components/event/CreateEvent.vue";
import EditEvent from "@/components/event/EditEvent.vue";
import CreateDiscussion from "@/components/discussion/CreateDiscussion.vue";
import EditDiscussion from "@/components/discussion/EditDiscussion.vue";
import CreateChannel from "@/components/channel/CreateChannel.vue";
import EditChannel from "@/components/channel/EditChannel.vue";
import MapView from "@/components/event/MapView.vue"
import EventListView from "@/components/event/EventListView.vue"

export const router = createRouter({
  history: createWebHistory(),
  linkActiveClass: "active",
  routes: [
    {
      path: "/",
      component: SearchEvents,
    },
    {
      name: 'SearchEvents',
      path: "/events",
      component: SearchEvents,
      children: [
        {
          name: 'SearchEventsList',
          path: "map",
          component: MapView,
          children: [
            {
              name: "SitewideSearchEventPreview",
              path: "search/:eventId",
              component: EventDetail
            }
          ]
        },
        {
          name: 'SearchEventsMap',
          path: "list",
          component: EventListView,
          children: [
            {
              name: "SitewideSearchEventPreview",
              path: "search/:eventId",
              component: EventDetail
            }
          ]
        },
        
      ]
    },
    {
      name: 'MapView',
      path: "/events/search/map",
      component: MapView
    },
    {
      path: "/events/create",
      name: "CreateEvent",
      component: CreateEvent,
    },
    {
      name: 'SearchDiscussions',
      path: "/discussions",
      component: SearchDiscussions,
      children: [
        {
          name: "SitewideSearchDiscussionPreview",
          path: "search/:discussionId",
          component: DiscussionDetail
        }
      ]
    },
    {
      name: 'FilterDiscussionsByTag',
      path: "/discussions/tag/:tag",
      component: SearchDiscussions
    },
    {
      path: "/discussions/create",
      name: "CreateDiscussion",
      component: CreateDiscussion,
    },
    {
      name: 'FilterChannelsByTag',
      path: "/channels/tag/:tag",
      component: SearchChannels
    },
    {
      name: "SearchChannels",
      path: "/channels/",
      component: SearchChannels,
    },
    {
      name: "CreateChannel",
      path: "/channels/create",
      component: CreateChannel
    },
    {
      path: "/channels/c/:channelId",
      name: "Channel",
      component: Channel,
      redirect: {
        name: "About",
      },
      children: [
        {
          name: "About",
          path: "about",
          component: About,
        },
        {
          name: "EditChannel",
          path: "edit",
          component: EditChannel
        },
        {
          name: "Discussions",
          path: "discussions",
          component: DiscussionTab,
          children: [
            {
              name: "SearchDiscussionsInChannel",
              path: "",
              component: SearchDiscussions,
              children: [
                {
                  name: "SearchDiscussionPreview",
                  path: "search/:discussionId",
                  component: DiscussionDetail
                }
              ]
            },
            {
              name: "CreateDiscussionInChannel",
              path: "create",
              component: CreateDiscussion
            },
            {
              name: "DiscussionDetail",
              path: "d/:discussionId",
              component: DiscussionDetail,
            },
            {
              name: "EditDiscussion",
              path: "d/:discussionId/edit",
              component: EditDiscussion,
            },
          ],
        },
        {
          name: "Events",
          path: "events",
          component: EventTab,
          children: [
            {
              name: "SearchEventsInChannel",
              path: "",
              component: SearchEvents,
              children: [
                {
                  name: "SearchEventPreview",
                  path: "search/:eventId",
                  component: EventDetail
                }
              ]
            },
            {
              name: "CreateEventInChannel",
              path: "create",
              component: CreateEvent
            },
            {
              name: "EventDetail",
              path: "e/:eventId",
              component: EventDetail,
            },
            {
              name: "EditEvent",
              path: "e/:eventId/edit",
              component: EditEvent,
            },
          ],
        },
      ],
    },
    { path: "/feeds", component: SearchFeeds },
    { path: "/feeds/:feedId", component: Feed },
    { path: "/u/:username", component: UserProfile },

    { path: "/settings", component: SiteSettings },
  ],
});
