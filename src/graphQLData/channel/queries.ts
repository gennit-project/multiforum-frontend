import { gql } from "@apollo/client/core";
export const GET_CHANNEL_NAMES = gql`
  query getChannelNames($channelWhere: ChannelWhere) {
    channels(where: $channelWhere, options: { limit: 50 }) {
      uniqueName
    }
  }
`;

export const GET_CHANNEL = gql`
  query getChannel($uniqueName: String!) {
    channels(where: { uniqueName: $uniqueName }) {
      uniqueName
      description
      Tags {
        text
      }
      Admins {
        username
        commentKarma
        discussionKarma
        createdAt
      }
      DiscussionChannelsAggregate {
        count
      }
      EventChannelsAggregate {
        count
      }
    }
  }
`;
export const GET_CHANNELS = gql`
  query getChannels(
    $channelWhere: ChannelWhere
    $eventChannelWhere: EventChannelWhere
    $limit: Int
    $offset: Int
    $sort: [ChannelSort!]
  ) {
    channelsAggregate(where: $channelWhere) {
      count
    }
    channels(
      where: $channelWhere
      options: { 
        limit: $limit, 
        offset: $offset 
        sort: $sort
      }
    ) {
      uniqueName
      description
      Tags {
        text
      }
      EventChannelsAggregate(where: $eventChannelWhere) {
        count
      }
      DiscussionChannelsAggregate {
        count
      }
    }
  }
`;
