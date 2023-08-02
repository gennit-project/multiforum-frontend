import { createRouter, createWebHistory } from "vue-router";
import Channel from "./components/channel/Channel.vue";
import UserProfile from "./components/user/UserProfile.vue";
import SearchChannels from "./components/channel/SearchChannels.vue";
import EventDetail from "./components/event/detail/EventDetail.vue";
import SearchEvents from "./components/event/list/SearchEvents.vue";
import Feed from "./components/feed/Feed.vue";
import SearchFeeds from "./components/feed/SearchFeeds.vue";
import DiscussionTab from "@/components/channel/DiscussionTab.vue"
import EventTab from "@/components/channel/EventTab.vue";
import DiscussionDetail from "./components/discussion/detail/DiscussionDetail.vue";
import SearchDiscussions from "./components/discussion/list/SearchDiscussions.vue";
import AboutColumn from "./components/channel/AboutColumn.vue";
import SiteSettings from "./components/settings/SiteSettings.vue";
import CreateEvent from "@/components/event/form/CreateEvent.vue";
import EditEvent from "@/components/event/form/EditEvent.vue";
import CreateDiscussion from "@/components/discussion/form/CreateDiscussion.vue";
import EditDiscussion from "@/components/discussion/form/EditDiscussion.vue";
import CreateChannel from "@/components/channel/form/CreateChannel.vue";
import EditChannel from "@/components/channel/form/EditChannel.vue";
import MapView from "@/components/event/list/MapView.vue";
import EventListView from "@/components/event/list/EventListView.vue";
import PageNotFound from "@/components/generic/PageNotFound.vue";
import LogoutPage from "@/components/auth/LogoutPage.vue";
import CreateUsernamePage from "@/components/auth/CreateUsernamePage.vue";
import CommentPermalink from "@/components/comments/CommentPermalink.vue";
import CommentModHistory from "@/components/comments/CommentModHistory.vue";
import ModProfile from "@/components/mod/ModProfile.vue";
import DownvotedDiscussions from "@/components/mod/DownvotedDiscussions.vue";
import DownvotedComments from "@/components/mod/DownvotedComments.vue";
import UserComments from "@/components/user/UserComments.vue"
import UserDiscussions from "@/components/user/UserDiscussions.vue"
import UserEvents from "@/components/user/UserEvents.vue"

export const router = createRouter({
  history: createWebHistory(),
  linkActiveClass: "active",
  routes: [
    {
      path: "/",
      component: SearchDiscussions,
    },
    {
      path: "/u/:username", 
      component: UserProfile,
      name: "UserProfile",
      children: [
        {
          name: "UserAuthoredDiscussions",
          path: "discussions",
          component: UserDiscussions
        },
        {
          name: "UserPostedEvents",
          path: "events",
          component: UserEvents
        },
        {
          name: "UserAuthoredComments",
          path: "comments",
          alias: "",
          component: UserComments
        },

      ]
    },
    {
      path: "/logout",
      component: LogoutPage,
    },
    {
      path: "/createUsername",
      component: CreateUsernamePage,
    },
    {
      name: "MapView",
      path: "/map",
      component: MapView,
      children: [
        {
          name: "MapEventPreview",
          path: "/map/search/:eventId",
          component: EventDetail,
        },
      ],
    },

    {
      name: "SearchEvents",
      path: "/events",
      component: SearchEvents,
      children: [
        {
          name: "SearchEventsList",
          path: "list/search",
          component: EventListView,
          children: [
            {
              name: "SitewideSearchEventPreview",
              path: ":eventId",
              component: EventDetail,
            },
          ],
        },
      ],
    },
    {
      path: "/events/create",
      name: "CreateEvent",
      component: CreateEvent,
    },
    {
      name: "SearchDiscussions",
      path: "/discussions",
      component: SearchDiscussions,
      children: [
        {
          name: "SitewideSearchDiscussionPreview",
          path: "search/:discussionId",
          component: DiscussionDetail,
        },
      ],
    },
    {
      name: "FilterDiscussionsByTag",
      path: "/discussions/tag/:tag",
      component: SearchDiscussions,
    },
    {
      path: "/discussions/create",
      name: "CreateDiscussion",
      component: CreateDiscussion,
    },
    {
      name: "FilterChannelsByTag",
      path: "/channels/tag/:tag",
      component: SearchChannels,
    },
    {
      name: "SearchChannels",
      path: "/channels/",
      component: SearchChannels,
    },
    {
      name: "CreateChannel",
      path: "/channels/create",
      component: CreateChannel,
    },
    {
      path: "/channels/c/:channelId",
      name: "Channel",
      component: Channel,
      redirect: {
        name: "Discussions",
      },
      children: [
        {
          name: "EditChannel",
          path: "edit",
          component: EditChannel,
        },
        {
          name: "About",
          path: "about",
          component: AboutColumn,
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
                  component: DiscussionDetail,
                },
              ],
            },
            {
              name: "CreateDiscussionInChannel",
              path: "create",
              component: CreateDiscussion,
            },
            {
              name: "DiscussionDetail",
              path: "d/:discussionId",
              component: DiscussionDetail,
              children: [
                {
                  name: "DiscussionCommentPermalink",
                  path: "comments/:commentId",
                  component: CommentPermalink,
                  children: [{
                    name: "DiscussionCommentModHistory",
                    path: "modhistory",
                    component: CommentModHistory
                  }]
                }
              ]
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
              path: "search",
              component: EventListView,
              children: [
                {
                  name: "SearchEventPreview",
                  path: ":eventId",
                  component: EventDetail,
                },
              ],
            },
            {
              name: "CreateEventInChannel",
              path: "create",
              component: CreateEvent,
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
    
    { 
      path: "/mod/:modId", 
      component: ModProfile,
      children: [
        {
          name: "ModProfileDownvotedDiscussions",
          path: "downvoted/discussions",
          component: DownvotedDiscussions
        },
        {
          name: "ModProfileDownvotedComments",
          path: "",
          component: DownvotedComments 
        }
      ]
    },
    { path: "/settings", component: SiteSettings },
    {
      path: "/:catchAll(.*)",
      component: PageNotFound,
    },
  ],
});
