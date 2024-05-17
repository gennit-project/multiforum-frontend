import { gql } from "@apollo/client/core";

export const AUTHOR_FIELDS = gql`
  fragment AuthorFields on User {
    username
    displayName
    profilePicURL
    createdAt
    discussionKarma
    commentKarma
  }
`;

const DISCUSSION_FIELDS = gql`
  ${AUTHOR_FIELDS}
  fragment DiscussionFields on Discussion {
    id
    title
    body
    createdAt
    updatedAt
    Author {
      ...AuthorFields
    }
    DiscussionChannels {
      id
      discussionId
      channelUniqueName
      weightedVotesCount
      UpvotedByUsers {
        username
      }
      Channel {
        uniqueName
      }
      Discussion {
        id
      }
      CommentsAggregate {
        count
      }
    }
    Tags {
      text
    }
  }
`;

// For channel list view
export const GET_DISCUSSIONS_WITH_DISCUSSION_CHANNEL_DATA = gql`
  ${AUTHOR_FIELDS}
  query getDiscussionsInChannel(
    $channelUniqueName: String!
    $searchInput: String!
    $selectedTags: [String!]
    $options: DiscussionListOptions
  ) {
    getDiscussionsInChannel(
      channelUniqueName: $channelUniqueName
      options: $options
      selectedTags: $selectedTags
      searchInput: $searchInput
    ) {
      aggregateDiscussionChannelsCount
      discussionChannels {
        id
        discussionId
        channelUniqueName
        CommentsAggregate {
          count
        }
        weightedVotesCount
        createdAt
        Channel {
          uniqueName
        }
        UpvotedByUsers {
          username
        }
        UpvotedByUsersAggregate {
          count
        }
        Discussion {
          id
          title
          body
          createdAt
          updatedAt
          Author {
            ...AuthorFields
          }
          Tags {
            text
          }
        }
      }
    }
  }
`;

// For site wide list view
export const GET_SITE_WIDE_DISCUSSION_LIST = gql`
  query getSiteWideDiscussionList(
    $searchInput: String!
    $selectedChannels: [String!]
    $selectedTags: [String!]
    $options: DiscussionListOptions
  ) {
    getSiteWideDiscussionList(
      searchInput: $searchInput
      selectedChannels: $selectedChannels
      selectedTags: $selectedTags
      options: $options
    ) {
      aggregateDiscussionCount
      discussions {
        id
        title
        body
        createdAt
        updatedAt
        Author {
          ...AuthorFields
        }
        DiscussionChannels {
          id
          createdAt
          channelUniqueName
          discussionId
          weightedVotesCount
          UpvotedByUsers {
            username
          }
          CommentsAggregate {
            count
          }
        }
        Tags {
          text
        }
      }
    }
  }
  ${AUTHOR_FIELDS}
`;

export const GET_DISCUSSION = gql`
  ${DISCUSSION_FIELDS}
  query getDiscussion($id: ID!, $loggedInModName: String!) {
    discussions(where: { id: $id }) {
      ...DiscussionFields
      FeedbackCommentsAggregate {
        count
      }
      FeedbackComments(
        where: {
          CommentAuthorConnection: {
            ModerationProfile: { node: { displayName: $loggedInModName } }
          }
        }
      ) {
        id
      }
    }
  }
`;

export const GET_DISCUSSION_FEEDBACK = gql`
  query getDiscussionFeedback($id: ID!, $limit: Int, $offset: Int) {
    discussions(where: { id: $id }) {
      id
      title
      body
      Author {
        username
      }
      FeedbackCommentsAggregate {
        count
      }
      FeedbackComments(options: { limit: $limit, offset: $offset }) {
        id
        text
        createdAt
        Channel {
          uniqueName
        }
        CommentAuthor {
          ... on ModerationProfile {
            displayName
          }
        }
      }
    }
  }
`;

export const GET_SPECIFIC_DISCUSSION_FEEDBACK = gql`
  query getSpecificDiscussionFeedback($discussionId: ID, $modName: String) {
    comments(
      where: {
        GivesFeedbackOnDiscussion: { id: $discussionId }
        CommentAuthorConnection: {
          ModerationProfile: { node: { displayName: $modName } }
        }
      }
    ) {
      id
      text
      createdAt
      Channel {
        uniqueName
      }
      CommentAuthor(where: { ModerationProfile: { displayName: $modName } }) {
        ... on ModerationProfile {
          displayName
        }
      }
    }
  }
`;
