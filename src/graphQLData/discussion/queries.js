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
      upvoteCount
      UpvotedByUsers {
        username
      }
      channelUniqueName
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

export const GET_DISCUSSIONS_WITH_DISCUSSION_CHANNEL_DATA = gql`
  ${DISCUSSION_FIELDS}
  query getDiscussionChannels(
    $where: DiscussionChannelWhere
    $resultsOrder: [DiscussionChannelSort!]
    $offset: Int
    $limit: Int
  ) {
    discussionChannelsAggregate(where: $where) {
      count
    }
    discussionChannels(
      where: $where
      options: { sort: $resultsOrder, offset: $offset, limit: $limit }
    ) {
      id,
      discussionId
      channelUniqueName
      Channel {
        uniqueName
      }
      Discussion {
        ...DiscussionFields
      }
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
