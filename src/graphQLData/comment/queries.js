import { gql } from '@apollo/client/core';

const AUTHOR_FIELDS = gql`
  fragment AuthorFields on User {
    username
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
    CommentAuthor {
      ...AuthorFields
    }
    createdAt
    updatedAt
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

export const GET_DISCUSSION_CHANNEL_BY_ID = gql`
  query getDiscussionChannel($id: ID!) {
    discussionChannels(
      where: {
        id: $id
      }
    ) {
      id
      id
      upvoteCount
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
      Comments(
        where: {
          isRootComment: true
        }
      ) {
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
export const GET_DISCUSSION_CHANNEL_BY_CHANNEL_AND_DISCUSSION_ID = gql`
  query getDiscussionChannel($channelUniqueName: String!, $discussionId: ID!) {
    discussionChannels(
      where: {
        channelUniqueName: $channelUniqueName
        discussionId: $discussionId
      }
    ) {
      id
      upvoteCount
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
      UpvotedByUsers {
        username
      }
      DownvotedByModerators {
        displayName
      }
      DownvotedByModeratorsAggregate {
        count
      }
      Comments(
        where: {
          isRootComment: true
        }
      ) {
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

export const GET_COMMENT_AND_REPLIES = gql`
  query getCommentWithReplies($id: ID!) {
    comments(
      where: {
        id: $id
      }
    ) {
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
  query getCommentWithReplies($id: ID!) {
    comments(
      where: {
        id: $id
      }
    ) {
      id
      ChildCommentsAggregate {
        count
      }
      ...CommentVoteFields
      ChildComments {
        ...CommentFields
      }
    }
  }
  ${AUTHOR_FIELDS}
  ${COMMENT_FIELDS}
  ${COMMENT_VOTE_FIELDS}
`;
