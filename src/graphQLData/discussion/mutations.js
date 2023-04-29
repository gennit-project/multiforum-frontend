import { gql } from "@apollo/client/core";

export const CREATE_DISCUSSION = gql`
  mutation createDiscussion($createDiscussionInput: [DiscussionCreateInput!]!) {
    createDiscussions(input: $createDiscussionInput) {
      discussions {
        id
        title
        body
        Channels {
          uniqueName
        }
        Author {
          username
        }
        createdAt
        updatedAt
        Tags {
          text
        }
      }
    }
  }
`;

export const UPDATE_DISCUSSION = gql`
  mutation updateDiscussions(
    $updateDiscussionInput: DiscussionUpdateInput
    $discussionWhere: DiscussionWhere
  ) {
    updateDiscussions(update: $updateDiscussionInput, where: $discussionWhere) {
      discussions {
        id
        title
        body
        Channels {
          uniqueName
        }
        Author {
          username
        }
        createdAt
        updatedAt
        Tags {
          text
        }
        UpvotedByUsersAggregate {
          count
        }
        DownvotedByModeratorsAggregate {
          count
        }
      }
    }
  }
`;

export const DELETE_DISCUSSION = gql`
  mutation deleteDiscussion($id: ID!) {
    deleteDiscussions(where: { id: $id }) {
      nodesDeleted
      relationshipsDeleted
    }
  }
`;

export const UPVOTE_DISCUSSION = gql`
  mutation upvoteDiscussion($id: ID!, $username: String!) {
    updateDiscussions(
      where: { id: $id },
      connect: {
        UpvotedByUsers: {
          where: { node: { username: $username } }
        }
      }
    ) {
      discussions {
        id
        UpvotedByUsers {
          username
        }
        UpvotedByUsersAggregate {
          count
        }
      }
    }
  }
`

export const UPVOTE_COMMENT_SECTION = gql`
  mutation upvoteCommentSection($id: ID!, $username: String!) {
    updateCommentSections(
      where: { id: $id },
      connect: {
        UpvotedByUsers: {
          where: { node: { username: $username } }
        }
      }
    ) {
      commentSections {
        id
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
        OriginalPost {
          ... on Discussion {
            id
            title
            Author {
              username
            }
          }
        }
      }
    }
  }
`


export const UNDO_UPVOTE_DISCUSSION = gql`
  mutation undoUpvoteDiscussion($id: ID!, $username: String!) {
    updateDiscussions(
      where: { id: $id },
      disconnect: {
        UpvotedByUsers: {
          where: { node: { username: $username } }
        }
      }
    ) {
      discussions {
        id
        UpvotedByUsers {
          username
        }
        UpvotedByUsersAggregate {
          count
        }
      }
      
    }
  }`


export const UNDO_UPVOTE_COMMENT_SECTION = gql`
  mutation undoUpvoteCommentSection($id: ID!, $username: String!) {
    updateCommentSections(
      where: { id: $id },
      disconnect: {
        UpvotedByUsers: {
          where: { node: { username: $username } }
        }
      }
    ) {
      commentSections {
        id
        UpvotedByUsers {
          username
        }
        UpvotedByUsersAggregate {
          count
        }
      }
    }
  }`


export const DOWNVOTE_DISCUSSION = gql`
  mutation downvoteDiscussion($id: ID!, $displayName: String!) {
    updateDiscussions(
      where: { id: $id }
      connect: {
        DownvotedByModerators: {
          where: { node: { displayName: $displayName } }
        }
      }
    ) {
      discussions {
        id
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

export const DOWNVOTE_COMMENT_SECTION = gql`
  mutation downvoteCommentSections($id: ID!, $displayName: String!) {
    updateCommentSections(
      where: { id: $id }
      connect: {
        DownvotedByModerators: {
          where: { node: { displayName: $displayName } }
        }
      }
    ) {
      commentSections {
        id
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
        OriginalPost {
          ... on Discussion {
            id
            title
            Author {
              username
            }
          }
        }
      }
    }
  }
`;


export const UNDO_DOWNVOTE_DISCUSSION = gql`
  mutation undoDownvoteDiscussion($id: ID!, $displayName: String!) {
    updateCommentSections(
      where: { id: $id }
      disconnect: {
        DownvotedByModerators: {
          where: { node: { displayName: $displayName } }
        }
      }
    ) {
      commentSections {
        id
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

export const UNDO_DOWNVOTE_COMMENT_SECTION = gql`
  mutation undoDownvoteCommentSection($id: ID!, $displayName: String!) {
    updateCommentSections(
      where: { id: $id }
      disconnect: {
        DownvotedByModerators: {
          where: { node: { displayName: $displayName } }
        }
      }
    ) {
      commentSections {
        id
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

