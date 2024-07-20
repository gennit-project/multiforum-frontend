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
import DiscussionFeedback from "@/components/discussion/detail/DiscussionFeedback.vue";
import EventFeedback from "@/components/event/detail/EventFeedback.vue";
import ModProfile from "@/components/mod/ModProfile.vue";
import UserComments from "@/components/user/UserComments.vue";
import UserDiscussions from "@/components/user/UserDiscussions.vue";
import UserEvents from "@/components/user/UserEvents.vue";
import Subreddit from "./components/subreddit/Subreddit.vue";
import AccountSettings from "./components/user/AccountSettings.vue";
import Issues from "./components/mod/Issues.vue";
import IssueDetailPage from "./components/mod/IssueDetailPage.vue";
import OpenIssues from "./components/mod/OpenIssues.vue";
import ClosedIssues from "./components/mod/ClosedIssues.vue";
import CommentFeedback from "./components/comments/CommentFeedback.vue";
import PrivacyPolicy from "./components/legal/PrivacyPolicy.vue";
import TermsOfUse from "./components/legal/TermsOfUse.vue";

export const router = createRouter({
  history: createWebHistory(),
  linkActiveClass: "active",
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash) {
      const unescapedHash = to.hash.replace(/^#/, ""); // Remove the leading '#'
      const element = document.querySelector(`#${CSS.escape(unescapedHash)}`);
      if (element) {
        return {
          selector: `#${CSS.escape(unescapedHash)}`,
          behavior: "smooth",
        };
      }
    } else {
      return { x: 0, y: 0 };
    }
  },
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
        },
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
          name: "DiscussionDetail",
          path: "/channels/c/:channelId/discussions/d/:discussionId",
          component: DiscussionDetail,
          children: [
            {
              name: "DiscussionCommentPermalink",
              path: "comments/:commentId",
              component: PermalinkedComment,
            },
          ],
        },
        {
          name: "FeedbackOnCommentFeedback",
          path: "discussions/d/:discussionId/commentFeedback/:commentId",
          component: CommentFeedback,
        },
        {
          name: "CommentFeedback",
          path: "discussions/d/:discussionId/comments/:commentId/feedback",
          component: CommentFeedback,
        },
        {
          name: "DiscussionCommentFeedbackPermalink",
          path: "discussions/d/:discussionId/comments/:commentId/feedback/:feedbackId",
          component: CommentFeedback,
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
          children: [
            {
              name: "OpenIssues",
              path: "",
              component: OpenIssues,
            },
            {
              name: "ClosedIssues",
              path: "closed",
              component: ClosedIssues,
            },
          ],
        },
        {
          name: "IssueDetail",
          path: "issues/i/:issueId",
          component: IssueDetailPage,
        },
        {
          name: "DiscussionFeedback",
          path: "discussions/d/:discussionId/feedback",
          component: DiscussionFeedback,
        },
        {
          name: "EventFeedback",
          path: "events/e/:eventId/feedback",
          component: EventFeedback,
        },
        {
          name: "CreateDiscussionInChannel",
          path: "discussions/create",
          component: CreateDiscussion,
        },
        {
          name: "EditDiscussion",
          path: "discussions/d/:discussionId/edit",
          component: EditDiscussion,
        },
        {
          name: "SearchDiscussionsInChannel",
          path: "discussions",
          component: SearchDiscussions,
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
              children: [
                {
                  name: "EventCommentPermalink",
                  path: "comments/:commentId",
                  component: PermalinkedComment,
                },
              ],
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
      name: "ModProfile",
      path: "/mod/:modId",
      component: ModProfile,
    },
    { path: "/settings", component: SiteSettings },
    {
      path: "/:catchAll(.*)",
      component: PageNotFound,
    },
    {
      name: "PrivacyPolicy",
      path: "/privacy-policy",
      component: PrivacyPolicy
    },
    {
      name: "TermsOfUse",
      path: "/terms-of-use",
      component: TermsOfUse
    },
  ],
});
