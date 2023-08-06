import { gql } from "@apollo/client/core";

const AUTHOR_FIELDS = gql`
  fragment AuthorFields on User {
    username
  }
`;

const DISCUSSION_CHANNEL_VOTE_FIELDS = gql`
  fragment DiscussionChannelVoteFields on DiscussionChannel {
    UpvotedByUsers {
      username
    }
    UpvotedByUsersAggregate {
      count
    }
    DownvotedByModerators {
      displayName
    }
    DownvotedByModeratorsAggregate {
      count
    }
  }
`;

const DISCUSSION_FIELDS = gql`
  ${DISCUSSION_CHANNEL_VOTE_FIELDS}
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
      upvoteCount
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
      ...DiscussionChannelVoteFields
    }
    Tags {
      text
    }
  }
`;

// For channel list view
export const GET_DISCUSSIONS_WITH_DISCUSSION_CHANNEL_DATA = gql`
  ${DISCUSSION_FIELDS}
  query getDiscussionChannels(
    $where: DiscussionChannelWhere
    $resultsOrder: [DiscussionChannelSort!]
    $offset: Int
    $limit: Int
  ) {
    discussionChannelsAggregate(where: $where) {
      count
    }
    discussionChannels(
      where: $where
      options: { sort: $resultsOrder, offset: $offset, limit: $limit }
    ) {
      id
      discussionId
      channelUniqueName
      CommentsAggregate {
        count
      }
      upvoteCount
      createdAt
      Channel {
        uniqueName
      }
      UpvotedByUsers {
        username
      }
      Discussion {
        ...DiscussionFields
      }
    }
  }
`;

// For site wide list view
export const GET_SITE_WIDE_DISCUSSION_LIST = gql`
  ${DISCUSSION_FIELDS}
  query getSiteWideDiscussionList(
    $discussion: DiscussionWhere
    $selectedChannels: [String!]
    $resultsOrder: [DiscussionSort!]
    $offset: Int
    $limit: Int
  ) {
    discussionsAggregate(where: $discussion) {
      count
    }
    discussions {
      id
      title
      body
      Author {
        username
      }
      DiscussionChannels {
        id
        createdAt
        channelUniqueName
        discussionId
        upvoteCount
        UpvotedByUsers {
          username
        }
        Channel {
          uniqueName
        }
        Discussion {
          id
        }
      }
      createdAt
      updatedAt
      Tags {
        text
      }
    }
  }
`;

export const GET_DISCUSSION = gql`
  ${DISCUSSION_FIELDS}
  query getDiscussion($id: ID!) {
    discussions(where: { id: $id }) {
      ...DiscussionFields
    }
  }
`;
