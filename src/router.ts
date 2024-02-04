import { createRouter, createWebHistory } from "vue-router";
import Channel from "./components/channel/Channel.vue";
import UserProfile from "./components/user/UserProfile.vue";
import SearchChannels from "./components/channel/SearchChannels.vue";
import EventDetail from "./components/event/detail/EventDetail.vue";
import SearchEvents from "./components/event/list/SearchEvents.vue";
import Feed from "./components/feed/Feed.vue";
import SearchFeeds from "./components/feed/SearchFeeds.vue";
import EventTab from "@/components/channel/EventTab.vue";
import DiscussionDetail from "./components/discussion/detail/DiscussionDetail.vue";
import SearchDiscussions from "./components/discussion/list/SearchDiscussions.vue";
import ChannelAboutPage from "./components/channel/ChannelAboutPage.vue";
import SiteSettings from "./components/settings/SiteSettings.vue";
import CreateEvent from "@/components/event/form/CreateEvent.vue";
import EditEvent from "@/components/event/form/EditEvent.vue";
import CreateDiscussion from "@/components/discussion/form/CreateDiscussion.vue";
import EditDiscussion from "@/components/discussion/form/EditDiscussion.vue";
import CreateChannel from "@/components/channel/form/CreateChannel.vue";
import EditChannel from "@/components/channel/form/EditChannel.vue";
import MapView from "@/components/event/map/MapView.vue";
import EventListView from "@/components/event/list/EventListView.vue";
import PageNotFound from "@/components/generic/PageNotFound.vue";
import CreateUsernamePage from "@/components/auth/CreateUsernamePage.vue";
import PermalinkedComment from "@/components/comments/PermalinkedComment.vue";
import DiscussionReportList from "./components/discussion/detail/DiscussionReportList.vue";
import DiscussionModHistory from "@/components/discussion/detail/DiscussionModHistory.vue";
import ModProfile from "@/components/mod/ModProfile.vue";
import UserComments from "@/components/user/UserComments.vue";
import UserDiscussions from "@/components/user/UserDiscussions.vue";
import UserEvents from "@/components/user/UserEvents.vue";
import Subreddit from "./components/subreddit/Subreddit.vue";
import AccountSettings from "./components/user/AccountSettings.vue";
import Issues from "./components/mod/Issues.vue";
import IssueDetailPage from "./components/mod/IssueDetailPage.vue";

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
          component: UserDiscussions,
        },
        {
          name: "UserPostedEvents",
          path: "events",
          component: UserEvents,
        },
        {
          name: "UserAuthoredComments",
          path: "comments",
          alias: "",
          component: UserComments,
        },
        {
          name: "AccountSettings",
          path: "settings",
          component: AccountSettings,
        }
      ],
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
      path: "/subreddits/r/:subredditName",
      name: "Subreddit",
      component: Subreddit,
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
          component: ChannelAboutPage,
        },
        {
          name: "Moderation",
          path: "issues",
          component: Issues,

        },
        {
          name: "IssueDetail",
          path: "issues/i/:issueId",
          component: IssueDetailPage
        },
        {
          name: "DiscussionModHistory",
          path: "discussions/d/:discussionId/modhistory",
          component: DiscussionModHistory,
          children: [
            {
              name: "DiscussionModHistoryReports",
              path: "reports",
              component: DiscussionReportList,
            }
          ]
        },
        {
          name: "DiscussionDetail",
          path: "discussions/d/:discussionId",
          component: DiscussionDetail,
          children: [
            
            {
              name: "DiscussionCommentPermalink",
              path: "comments/:commentId",
              component: PermalinkedComment,
              // children: [
              //   {
              //     name: "DiscussionCommentModHistory",
              //     path: "modhistory",
              //     component: CommentModHistory,
              //   },
              // ],
            },
          ],
        },
        {
          name: "CreateDiscussionInChannel",
          path: "discussions/create",
          component: CreateDiscussion,
        },
        {
          name: "SearchDiscussionsInChannel",
          path: "discussions",
          component: SearchDiscussions,
        },
        {
          name: "EditDiscussion",
          path: "discussions/d/:discussionId/edit",
          component: EditDiscussion,
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
              // children: [
              //   {
              //     name: "EventModHistory",
              //     path: "modhistory",
              //     component: CommentModHistory,
              //   },
              //   {
              //     name: "DiscussionCommentPermalink",
              //     path: "comments/:commentId",
              //     component: PermalinkedComment,
              //     children: [
              //       {
              //         name: "DiscussionCommentModHistory",
              //         path: "modhistory",
              //         component: CommentModHistory,
              //       },
              //     ],
              //   },
              // ],
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
    },
    { path: "/settings", component: SiteSettings },
    {
      path: "/:catchAll(.*)",
      component: PageNotFound,
    },
  ],
});
