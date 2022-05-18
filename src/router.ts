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

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: SearchEvents,
    },
    {
      name: 'SearchEvents',
      path: "/events",
      component: SearchEvents,
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
      path: "/channels/",
      component: SearchChannels,
    },
    {
      path: "/channels/:channelId",
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
          name: "Discussions",
          path: "discussions",
          component: DiscussionTab,
          children: [
            {
              name: "SearchDiscussionsInChannel",
              path: "",
              component: SearchDiscussions,
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
            },
            {
              name: "EventDetail",
              path: ":eventId",
              component: EventDetail,
            },
            {
              name: "EditEvent",
              path: ":eventId/edit",
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
