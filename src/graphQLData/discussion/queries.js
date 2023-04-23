import { gql } from "@apollo/client/core";

const AUTHOR_FIELDS = gql`
  fragment AuthorFields on User {
    username
  }
`;

const VOTE_FIELDS = gql`
  fragment VoteFields on CommentSection {
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
    Channels {
      uniqueName
    }
    Tags {
      text
    }
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
      CommentSections {
        id
        __typename
        OriginalPost {
          ... on Discussion {
            id
            title
          }
        }
      }
    }
  }
  ${AUTHOR_FIELDS}
  ${DISCUSSION_FIELDS}
`;

export const GET_DISCUSSIONS_WITH_COMMENT_SECTION_DATA = gql`
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
      CommentSections(where: { Channel: { uniqueName: $channelId } }) {
        id
        __typename
        ...VoteFields
        OriginalPost {
          ... on Discussion {
            id
            title
          }
        }
      }
    }
  }
  ${AUTHOR_FIELDS}
  ${DISCUSSION_FIELDS}
  ${VOTE_FIELDS}
`;

// get discussion by ID
export const GET_DISCUSSION = gql`
  query getDiscussion($id: ID!) {
    discussions(where: { id: $id }) {
      ...DiscussionFields
      CommentSections {
        id
        __typename
        Channel {
          uniqueName
        }
        CommentsAggregate {
          count
        }
        ...VoteFields
        OriginalPost {
          ... on Discussion {
            id
            title
          }
        }
      }
    }
  }
  ${AUTHOR_FIELDS}
  ${DISCUSSION_FIELDS}
  ${VOTE_FIELDS}
`;
