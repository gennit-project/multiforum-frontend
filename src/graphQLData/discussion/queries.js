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

export const SITEWIDE_GET_DISCUSSIONS = gql`
  ${DISCUSSION_FIELDS}
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
    }
  }
`;

export const GET_DISCUSSIONS_WITH_DISCUSSION_CHANNEL_DATA = gql`
  ${DISCUSSION_FIELDS}
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
