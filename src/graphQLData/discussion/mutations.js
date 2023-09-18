import { gql } from "@apollo/client/core";

export const ADD_EMOJI_TO_DISCUSSION_CHANNEL = gql`
  mutation addEmojiToDiscussionChannel(
    $discussionChannelId: ID!, 
    $emojiLabel: String!,
    $unicode: String!,
    $username: String!
  ) {
    addEmojiToDiscussionChannel (
      discussionChannelId: $discussionChannelId,
      emojiLabel: $emojiLabel,
      unicode: $unicode,
      username: $username
    ) {
      id
      emoji
    }
  }
`;

export const REMOVE_EMOJI_FROM_DISCUSSION_CHANNEL = gql`
  mutation removeEmojiFromDiscussionChannel(
    $discussionChannelId: ID!,
    $emojiLabel: String!,
    $username: String!
  ) {
    removeEmojiFromDiscussionChannel (
      discussionChannelId: $discussionChannelId,
      emojiLabel: $emojiLabel,
      username: $username
    ) {
      id
      emoji
    }
  }
`;

export const CREATE_DISCUSSION_WITH_CHANNEL_CONNECTIONS = gql`
  mutation createDiscussion(
    $discussionCreateInput: DiscussionCreateInput
    $channelConnections: [String]
  ) {
    createDiscussionWithChannelConnections(
      discussionCreateInput: $discussionCreateInput
      channelConnections: $channelConnections
    ) {
      id
      title
      body
      DiscussionChannels {
        id
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
`;

export const UPDATE_DISCUSSION_WITH_CHANNEL_CONNECTIONS = gql`
  mutation updateDiscussions(
    $updateDiscussionInput: DiscussionUpdateInput!
    $discussionWhere: DiscussionWhere!
    $channelConnections: [String!]!
    $channelDisconnections: [String!]!
  ) {
    updateDiscussionWithChannelConnections(
      discussionUpdateInput: $updateDiscussionInput
      discussionWhere: $discussionWhere
      channelConnections: $channelConnections
      channelDisconnections: $channelDisconnections
    ) {
      id
      title
      body
      DiscussionChannels {
        id
        channelUniqueName
        discussionId
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
    upvoteDiscussionChannel(discussionChannelId: $id, username: $username) {
      id
      weightedVotesCount
      UpvotedByUsers {
        username
      }
      UpvotedByUsersAggregate {
        count
      }
    }
  }
`;

export const UNDO_UPVOTE_DISCUSSION_CHANNEL = gql`
  mutation undoUpvoteDiscussionChannel($id: ID!, $username: String!) {
    undoUpvoteDiscussionChannel(discussionChannelId: $id, username: $username) {
      id
      weightedVotesCount
      UpvotedByUsers {
        username
      }
      UpvotedByUsersAggregate {
        count
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
        discussionId
        channelUniqueName
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
        discussionId
        channelUniqueName
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
