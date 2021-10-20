import { createRouter, createWebHistory } from "vue-router";
import Channel from "./components/channel/Channel.vue";
import UserProfile from "./components/UserProfile.vue";
import SearchChannels from "./components/channel/SearchChannels.vue";
import Event from "./components/event/Event.vue";
import AllEvents from "./components/event/AllEvents.vue";
import SearchEvents from "./components/event/SearchEvents.vue";
import Discussion from "./components/discussion/Discussion.vue";
import AllDiscussions from "./components/discussion/AllDiscussions.vue";
import SearchDiscussions from "./components/discussion/SearchDiscussions.vue";
import Overview from "./components/channel/Overview.vue";
import SiteSettings from "./components/SiteSettings.vue";
import SearchOptions from "./components/event/SearchOptions.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: SearchOptions },
    { path: "/events", component: AllEvents },
    { path: "/discussions", component: AllDiscussions },
    { path: "/channels", component: SearchChannels },
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
// - map pins trigger preview on mouseover
// - map pins trigger event preview on click
// - event list uses sticky dates
// - fix popover component

// buttons
// - channel detail and list page - pin to site navbar

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

// feeds
// - list - breadcrumbs
// - detail - show sources, author, breadcrumbs
// - feed item preview - overlay
// - sidebar - feeds
// - sidebar - my feeds