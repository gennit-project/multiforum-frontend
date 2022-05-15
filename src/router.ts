import { createRouter, createWebHistory } from "vue-router";
import Channel from "./components/channel/Channel.vue";
import UserProfile from "./components/UserProfile.vue";
import SearchChannels from "./components/channel/SearchChannels.vue";
import EventDetail from "./components/event/EventDetail.vue";
import SearchEvents from "./components/event/SearchEvents.vue";
import Feed from "./components/feed/Feed.vue";
import SearchFeeds from "./components/feed/SearchFeeds.vue";
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
      component: CreateEvent
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
      component: CreateDiscussion
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
        name: "Channel.about"
      },
      children: [
        { 
          path: "about", 
          name: "Channel.about", 
          component: About 
        },
        {
          name: "About",
          path: "about",
          component: About,
        },
        {
          path: "discussions",
          component: SearchDiscussions
        },
        {
          path: "discussions/:discussionId/edit",
          component: EditDiscussion
        },
        {
          name: "DiscussionDetail",
          path: "discussions/:discussionId",
          component: DiscussionDetail
        },
        {
          path: "events",
          component: SearchEvents
        },
        {
          path: "events/:eventId/edit",
          component: EditEvent
        },
        {
          path: "events/:eventId",
          component: EventDetail
        }
      ],
    },
    { path: "/feeds", component: SearchFeeds },
    { path: "/feeds/:feedId", component: Feed },
    { path: "/u/:username", component: UserProfile },

    { path: "/settings", component: SiteSettings },
  ],
});
