import { gql } from '@apollo/client/core';

export const GET_COMMUNITY = gql`
  query getCommunity($url: String!) {
    getCommunity(url: $url) {
      name
      url
      description
      Organizers {
        username
      }
      Moderators {
        username
      }
      Tags {
        text
      }
    }
  }
`;
export const GET_DISCUSSIONS = gql`
  query {
    queryDiscussion {
      id
      title
      body
      Communities(filter: { url: { eq: "dogs" } }) {
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
        Community {
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
export const GET_COMMUNITIES = gql`
  query queryCommunity {
    queryCommunity {
      name
      url
      description
      Organizers {
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

export const GET_COMMUNITY_NAMES = gql`
query getCommunityNames {
    queryCommunity {
      url
    }
}
`