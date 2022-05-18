import { gql } from '@apollo/client/core';

export const GET_CHANNEL = gql`
  query getDiscussion($uniqueName: String!) {
    channels (
      where: { 
        uniqueName: $uniqueName
      }
    ) {
      uniqueName
      description
      Tags {
        text
      }
    }
  }
`;
export const GET_DISCUSSIONS = gql`
  query queryDiscussion{
    discussions {
      id
      title
      body
      Channels(filter: { url: { eq: "dogs" } }) {
        url
      }
      Author {
        username
      }
      Tags {
        text
      }
      CommentSections {
        id
        CommentsAggregate {
          count
        }
        Channel {
          url
        }
        Event {
          id
        }
        Discussion {
          id
        }
      }
      createdDate
    }
  }
`;
export const GET_CHANNELS = gql`
  query queryChannel {
    queryChannel {
      name
      url
      description
      Posters {
        username
      }
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
export const GET_CHANNEL_NAMES = gql`
query getChannelNames {
    channels {
      uniqueName
    }
}
`