import { gql } from "@apollo/client/core";

export const CREATE_DISCUSSION = gql`
  mutation createDiscussion($createDiscussionInput: [DiscussionCreateInput!]!) {
    createDiscussions(input: $createDiscussionInput) {
      discussions {
        id
        title
        body
        DiscussionChannels {
          Channel {
            uniqueName
          }
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
        DiscussionChannels {
          Channel {
            uniqueName
          }
          UpvotedByUsersAggregate {
            count
          }
          DownvotedByModeratorsAggregate {
            count
          }
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

export const DELETE_DISCUSSION = gql`
  mutation deleteDiscussion($id: ID!) {
    deleteDiscussions(where: { id: $id }) {
      nodesDeleted
      relationshipsDeleted
    }
  }
`;

export const UPVOTE_DISCUSSION_CHANNEL = gql`
  mutation upvoteDiscussionChannel($id: ID!, $username: String!) {
    updateDiscussionChannels(
      where: { id: $id }
      connect: { UpvotedByUsers: { where: { node: { username: $username } } } }
    ) {
      discussionChannels {
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
`;

export const UNDO_UPVOTE_DISCUSSION_CHANNEL = gql`
  mutation undoUpvoteDiscussionChannel($id: ID!, $username: String!) {
    updateDiscussionChannels(
      where: { id: $id }
      disconnect: {
        UpvotedByUsers: { where: { node: { username: $username } } }
      }
    ) {
      discussionChannels {
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
`;

export const DOWNVOTE_DISCUSSION_CHANNEL = gql`
  mutation downvoteDiscussionChannel($id: ID!, $displayName: String!) {
    updateDiscussionChannels(
      where: { id: $id }
      connect: {
        DownvotedByModerators: {
          where: { node: { displayName: $displayName } }
        }
      }
    ) {
      discussionChannels {
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

export const UNDO_DOWNVOTE_DISCUSSION_CHANNEL = gql`
  mutation undoDownvoteDiscussionChannel($id: ID!, $displayName: String!) {
    updateDiscussionChannels(
      where: { id: $id }
      disconnect: {
        DownvotedByModerators: {
          where: { node: { displayName: $displayName } }
        }
      }
    ) {
      discussionChannels {
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
