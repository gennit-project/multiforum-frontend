import { createRouter, createWebHistory } from "vue-router";
import Channel from "./components/channel/Channel.vue";
import UserProfile from "./components/UserProfile.vue";
import SearchChannels from "./components/channel/SearchChannels.vue";
import Event from "./components/event/Event.vue";
import SearchEvents from "./components/event/SearchEvents.vue";
import Feed from "./components/feed/Feed.vue";
import SearchFeeds from "./components/feed/SearchFeeds.vue";
import Discussion from "./components/discussion/Discussion.vue";
import SearchDiscussions from "./components/discussion/SearchDiscussions.vue";
import Overview from "./components/channel/Overview.vue";
import SiteSettings from "./components/SiteSettings.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: "/", 
      component: SearchEvents,
      props(route) {
        const tagStringArray = route.query.tag?.toString().split(',')
        const channelStringArray = route.query.channel?.toString().split(',')

        return {
          routerSearchTerms: route.query.search,
          routerTags: route.query.tag ? tagStringArray : [],
          routerChannels: route.query.channel ? channelStringArray : [],
          routerView: route.query.view
        }
      }
    },
    { 
      path: "/events", 
      component: SearchEvents,
      props(route) {
        const tagStringArray = route.query.tag?.toString().split(',')
        const channelStringArray = route.query.channel?.toString().split(',')

        return {
          routerSearchTerms: route.query.search,
          routerTags: route.query.tag ? tagStringArray : [],
          routerChannels: route.query.channel ? channelStringArray : [],
          routerView: route.query.view
        }
      }
    },
    {
      path: "/discussions",
      component: SearchDiscussions,
      props(route) {
        const tagStringArray = route.query.tag?.toString().split(',')
        const channelStringArray = route.query.channel?.toString().split(',')

        return {
          routerSearchTerms: route.query.search,
          routerTags: route.query.tag ? tagStringArray : [],
          routerChannels: route.query.channel ? channelStringArray : []
        }
      }
    },
    { 
      path: "/channels", 
      component: SearchChannels,
      props(route) {
        const tagStringArray = route.query.tag?.toString().split(',')

        return {
          routerSearchTerms: route.query.search,
          routerTags: route.query.tag ? tagStringArray : [],
        }
      }
    },
    { path: "/feeds", component: SearchFeeds },
    { path: "/feeds/:feedId", component: Feed },
    { path: "/u/:username", component: UserProfile },
    {
      path: "/c/:channelId/",
      component: Channel,
      children: [
        { path: "", component: Overview },
        {
          path: "discussions",
          component: SearchDiscussions,
        },
        {
          path: "events",
          component: SearchEvents,
        },
        {
          path: "/c/:channelId/discussions/:discussionId",
          component: Discussion,
        },
        { path: "/c/:channelId/events/:eventId", component: Event }
      ],
    },
    { path: "/settings", component: SiteSettings }
  ],
});


// sort and filter events
// - event list uses sticky dates

// site navbar
// - pinned channels section
// - log in/log out buttons
// - dark mode

// profile
// - user data preview on mouseover username

// forms
// - create/edit community
// - create/edit discussion
// - create/edit event
// - create/edit feed

// feeds
// - detail - show sources, author, breadcrumbs
// - feed item preview - overlay
// - sidebar - feeds
// - sidebar - my feeds