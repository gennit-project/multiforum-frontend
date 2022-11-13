import { gql } from "@apollo/client/core";
export const GET_CHANNEL_NAMES = gql`
  query getChannelNames ($channelWhere: ChannelWhere){
    channels (where: $channelWhere, options: {
      limit: 50
    }){
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
      }
    }
  }
`;
export const GET_CHANNELS = gql`
  query queryChannel {
    channels {
      name
      uniqueName
      description
      DiscussionsAggregate {
        count
      }
      EventsAggregate {
        count
      }
      Tags {
        text
      }
    }
  }
`;
