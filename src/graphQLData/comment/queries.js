import { gql } from '@apollo/client/core';

const AUTHOR_FIELDS = gql`
  fragment AuthorFields on User {
    username
  }
`;

const VOTE_FIELDS = gql`
  fragment VoteFields on Comment {
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
    ...VoteFields
  }
  ${AUTHOR_FIELDS}
`;

export const GET_COMMENT_SECTION = gql`
  query getCommentSection($id: ID!) {
    commentSections(
      where: {
        id: $id
      }
    ) {
      id
      Channel {
        uniqueName
      }
      OriginalPost {
        ... on Discussion {
          id
          title
          Author {
            ...AuthorFields
          }
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
  ${VOTE_FIELDS}
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
  ${VOTE_FIELDS}
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
      ...VoteFields
      ChildComments {
        ...CommentFields
      }
    }
  }
  ${AUTHOR_FIELDS}
  ${COMMENT_FIELDS}
  ${VOTE_FIELDS}
`;
