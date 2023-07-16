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
  ${AUTHOR_FIELDS}
`;

export const SITEWIDE_GET_DISCUSSIONS = gql`
  query getDiscussions(
    $where: DiscussionWhere
    $resultsOrder: [DiscussionSort!]
    $offset: Int
    $limit: Int
  ) {
    discussionsAggregate(where: $where) {
      count
    }
    discussions(
      where: $where
      options: { sort: $resultsOrder, offset: $offset, limit: $limit }
    ) {
      ...DiscussionFields
      DiscussionChannels {
        id
        __typenameDiscussion {
            id
            title
        }
      }
    }
  }
  ${AUTHOR_FIELDS}
  ${DISCUSSION_FIELDS}
`;

export const GET_DISCUSSIONS_WITH_DISCUSSION_CHANNEL_DATA = gql`
  query getDiscussions(
    $channelId: String
    $where: DiscussionWhere
    $resultsOrder: [DiscussionSort!]
    $offset: Int
    $limit: Int
  ) {
    discussionsAggregate(where: $where) {
      count
    }
    discussions(
      where: $where
      options: { sort: $resultsOrder, offset: $offset, limit: $limit }
    ) {
      ...DiscussionFields
    }
  }
  ${AUTHOR_FIELDS}
  ${DISCUSSION_FIELDS}
  ${DISCUSSION_CHANNEL_VOTE_FIELDS}
`;

// get discussion by ID
export const GET_DISCUSSION = gql`
  query getDiscussion($id: ID!) {
    discussions(where: { id: $id }) {
      ...DiscussionFields
    }
  }
  ${AUTHOR_FIELDS}
  ${DISCUSSION_FIELDS}
  ${DISCUSSION_CHANNEL_VOTE_FIELDS}
`;
