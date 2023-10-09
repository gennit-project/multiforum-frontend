import { gql } from "@apollo/client/core";

const AUTHOR_FIELDS = gql`
  fragment AuthorFields on User {
    username
    createdAt
    discussionKarma
    commentKarma
  }
`;

const COMMENT_VOTE_FIELDS = gql`
  fragment CommentVoteFields on Comment {
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

const COMMENT_FIELDS = gql`
  fragment CommentFields on Comment {
    id
    text
    emoji
    weightedVotesCount
    createdAt
    updatedAt
    CommentAuthor {
      ...AuthorFields
    }
    ChildCommentsAggregate {
      count
    }
    ParentComment {
      id
    }
    ...CommentVoteFields
  }
  ${AUTHOR_FIELDS}
`;


export const GET_DISCUSSION_CHANNEL_BY_CHANNEL_AND_DISCUSSION_ID = gql`
  query getCommentSection(
    $channelUniqueName: String!
    $discussionId: ID!
    $offset: Int
    $limit: Int
    $sort: String
  ) {
    getCommentSection(
        channelUniqueName: $channelUniqueName
        discussionId: $discussionId
        offset: $offset
        limit: $limit
        sort: $sort
    ) {
      id
      weightedVotesCount
      discussionId
      channelUniqueName
      emoji
      Channel {
        uniqueName
      }
      Discussion {
        id
        title
        Author {
          ...AuthorFields
        }
      }
      CommentsAggregate {
        count
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
      Comments {
        ...CommentFields
        ChildComments {
          id
          text
        }
      }
    }
  }
  ${AUTHOR_FIELDS}
  ${COMMENT_FIELDS}
  ${COMMENT_VOTE_FIELDS}
`;

export const GET_DISCUSSION_CHANNEL_BY_ID = gql`
  query getDiscussionChannel($id: ID!) {
    discussionChannels(where: { id: $id }) {
      id
      weightedVotesCount
      discussionId
      channelUniqueName
      Channel {
        uniqueName
      }
      Discussion {
        id
        title
        Author {
          ...AuthorFields
        }
      }
      CommentsAggregate {
        count
      }
      UpvotedByUsersAggregate {
        count
      }
      Comments(where: { isRootComment: true }) {
        ...CommentFields
        ChildComments {
          ...CommentFields
        }
      }
    }
  }
  ${AUTHOR_FIELDS}
  ${COMMENT_FIELDS}
  ${COMMENT_VOTE_FIELDS}
`;

export const GET_DISCUSSION_CHANNEL_ROOT_COMMENT_AGGREGATE = gql`
  query getDiscussionChannelRootCommentAggregate(
    $channelUniqueName: String!
    $discussionId: ID!
  ) {
    discussionChannels(
      where: {
        channelUniqueName: $channelUniqueName
        discussionId: $discussionId
      }
    ) {
      id
      CommentsAggregate(where: { isRootComment: true }) {
        count
      }
    }
  }
`;


export const GET_COMMENT_AND_REPLIES = gql`
  query getCommentWithReplies($id: ID!) {
    comments(where: { id: $id }) {
      ...CommentFields
      ChildComments {
        ...CommentFields
      }
    }
  }
  ${AUTHOR_FIELDS}
  ${COMMENT_FIELDS}
  ${COMMENT_VOTE_FIELDS}
`;

export const GET_COMMENT_REPLIES = gql`
  query getCommentWithReplies($id: ID!, $limit: Int, $offset: Int) {
    comments(where: { id: $id }) {
      ChildCommentsAggregate {
        count
      }
      ChildComments(options: { limit: $limit, offset: $offset }) {
        ...CommentFields
      }
    }
  }
  ${AUTHOR_FIELDS}
  ${COMMENT_FIELDS}
  ${COMMENT_VOTE_FIELDS}
`;
