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
import CreateEvent from "@/components/forms/create/event.vue";
import EditEvent from "@/components/forms/edit/event.vue";
import CreateDiscussion from "@/components/forms/create/discussion.vue";
import EditDiscussion from "@/components/forms/edit/discussion.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: SearchEvents,
      props(route) {
        const tagStringArray = route.query.tag?.toString().split(",");
        const channelStringArray = route.query.channel?.toString().split(",");

        return {
          routerSearchTerms: route.query.search,
          routerTags: route.query.tag ? tagStringArray : [],
          routerChannels: route.query.channel ? channelStringArray : [],
          routerView: route.query.view,
        };
      },
    },
    {
      path: "/events",
      component: SearchEvents,
      props(route) {
        const tagStringArray = route.query.tag?.toString().split(",");
        const channelStringArray = route.query.channel?.toString().split(",");

        return {
          routerSearchTerms: route.query.search,
          routerTags: route.query.tag ? tagStringArray : [],
          routerChannels: route.query.channel ? channelStringArray : [],
          routerView: route.query.view,
        };
      },
    },
    {
      path: "/events/create",
      name: "CreateEvent",
      component: CreateEvent,
    },
    {
      path: "/discussions",
      component: SearchDiscussions,
      props(route) {
        const tagStringArray = route.query.tag?.toString().split(",");
        const channelStringArray = route.query.channel?.toString().split(",");

        return {
          routerSearchTerms: route.query.search,
          routerTags: route.query.tag ? tagStringArray : [],
          routerChannels: route.query.channel ? channelStringArray : [],
        };
      },
    },
    {
      path: "/discussions/create",
      name: "CreateDiscussion",
      component: CreateDiscussion,
    },
    {
      path: "/channels/",
      component: SearchChannels,
      props(route) {
        const tagStringArray = route.query.tag?.toString().split(",");

        return {
          routerSearchTerms: route.query.search,
          routerTags: route.query.tag ? tagStringArray : [],
        };
      },
    },
    {
      path: "/channels/:channelId",
      name: "Channel",
      component: Channel,
      redirect: {
        name: "Channel.about",
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
              name: "SearchDiscussions",
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
              name: "SearchEvents",
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
