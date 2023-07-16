import { gql } from "@apollo/client/core";

export const UNDO_DOWNVOTE_COMMENT = gql`
  mutation undoDownvoteComment($id: ID!, $displayName: String) {
    updateComments(
      where: { id: $id }
      disconnect: {
        DownvotedByModerators: {
          where: { node: { displayName: $displayName } }
        }
      }
    ) {
      comments {
        id
        CommentAuthor {
          ... on User {
            username
          }
        }
        text
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
    }
  }
`;

export const UNDO_UPVOTE_COMMENT = gql`
  mutation undoUpvoteComment($id: ID!, $username: String) {
    updateComments(
      where: { id: $id }
      disconnect: {
        UpvotedByUsers: { where: { node: { username: $username } } }
      }
    ) {
      comments {
        id
        CommentAuthor {
          ... on User {
            username
          }
        }
        text
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
    }
  }
`;

export const DOWNVOTE_COMMENT = gql`
  mutation downvoteComment($id: ID!, $displayName: String) {
    updateComments(
      where: { id: $id }
      connect: {
        DownvotedByModerators: {
          where: { node: { displayName: $displayName } }
        }
      }
    ) {
      comments {
        id
        CommentAuthor {
          ... on User {
            username
          }
        }
        text
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
    }
  }
`;

export const UPVOTE_COMMENT = gql`
  mutation upvoteComment($id: ID!, $username: String) {
    updateComments(
      where: { id: $id }
      connect: { UpvotedByUsers: { where: { node: { username: $username } } } }
    ) {
      comments {
        id
        CommentAuthor {
          ... on User {
            username
          }
        }
        text
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
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation createComment($createCommentInput: [CommentCreateInput!]!) {
    createComments(input: $createCommentInput) {
      comments {
        id
        text
        Channel {
          uniqueName
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
        CommentAuthor {
          ... on User {
            username
          }
        }
        ParentComment {
          id
        }
        createdAt
        updatedAt
        ChildCommentsAggregate {
          count
        }
        ChildComments {
          id
          text
          createdAt
          CommentAuthor {
            ... on User {
              username
            }
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
      }
    }
  }
`;

export const CREATE_DISCUSSION_CHANNEL = gql`
  mutation createDiscussionChannel(
    $createDiscussionChannelInput: [DiscussionChannelCreateInput!]!
  ) {
    createDiscussionChannels(input: $createDiscussionChannelInput) {
      discussionChannels {
        id
        Discussion {
          id
          title
        }
        Channel {
          uniqueName
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
          id
          text
          CommentAuthor {
            ... on User {
              username
            }
          }
          ChildCommentsAggregate {
            count
          }
          ChildComments {
            id
          }
          createdAt
          updatedAt
        }
      }
    }
  }
`;

export const UPDATE_COMMENT = gql`
  mutation updateComment(
    $updateCommentInput: CommentUpdateInput
    $commentWhere: CommentWhere
  ) {
    updateComments(update: $updateCommentInput, where: $commentWhere) {
      comments {
        id
        text
        CommentAuthor {
          ... on User {
            username
          }
        }
        createdAt
        updatedAt
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
    }
  }
`;

export const SOFT_DELETE_COMMENT = gql`
  mutation updateComments($id: ID!) {
    updateComments(
      update: { text: "[Deleted]" }
      disconnect: {
        CommentAuthor: { User: { where: { node_NOT: { username: "null" } } } }
      }
      where: { id: $id }
    ) {
      comments {
        id
        text
        CommentAuthor {
          ... on User {
            username
          }
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation deleteComment($id: ID!) {
    deleteComments(where: { id: $id }) {
      nodesDeleted
      relationshipsDeleted
    }
  }
`;
