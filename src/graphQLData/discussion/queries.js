import { gql } from "@apollo/client/core";

export const AUTHOR_FIELDS = gql`
  fragment AuthorFields on User {
    username
    displayName
    createdAt
    discussionKarma
    commentKarma
  }
`;

const DISCUSSION_FIELDS = gql`
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
      discussionId
      channelUniqueName
      weightedVotesCount
      UpvotedByUsers {
        username
      }
      Channel {
        uniqueName
      }
      Discussion {
        id
      }
      CommentsAggregate {
        count
      }
    }
    Tags {
      text
    }
  }
`;

// For channel list view
export const GET_DISCUSSIONS_WITH_DISCUSSION_CHANNEL_DATA = gql`
  ${AUTHOR_FIELDS}
  query getDiscussionsInChannel(
    $channelUniqueName: String!
    $searchInput: String!
    $selectedTags: [String!]
    $options: DiscussionListOptions
  ) {
    getDiscussionsInChannel (
       channelUniqueName: $channelUniqueName,
       options: $options,
       selectedTags: $selectedTags,
       searchInput: $searchInput
    ) {
      aggregateDiscussionChannelsCount
      discussionChannels {
        id
        discussionId
        channelUniqueName
        CommentsAggregate {
          count
        }
        weightedVotesCount
        createdAt
        Channel {
          uniqueName
        }
        UpvotedByUsers {
          username
        }
        UpvotedByUsersAggregate {
          count
        }
        Discussion {
          id
          title
          body
          createdAt
          updatedAt
          Author {
            ...AuthorFields
          }
          Tags {
            text
          }
        }
      }
    }
  }
`;

// For site wide list view
export const GET_SITE_WIDE_DISCUSSION_LIST = gql`
  query getSiteWideDiscussionList(
    $searchInput: String!
    $selectedChannels: [String!]
    $selectedTags: [String!]
    $options: DiscussionListOptions
  ) {
    getSiteWideDiscussionList(
      searchInput: $searchInput
      selectedChannels: $selectedChannels
      selectedTags: $selectedTags
      options: $options
    ) {
      aggregateDiscussionCount
      discussions {
        id
        title
        body
        createdAt
        updatedAt
        Author {
          username
          commentKarma
          discussionKarma
          createdAt
        }
        DiscussionChannels {
          id
          createdAt
          channelUniqueName
          discussionId
          weightedVotesCount
          UpvotedByUsers {
            username
          }
          CommentsAggregate {
            count
          }
        }
        Tags {
          text
        }
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
