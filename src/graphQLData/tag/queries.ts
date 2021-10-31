import { gql } from "@apollo/client/core";

export const GET_TAGS = gql`
  query getTags {
    queryTag {
      text
    }
  }
`;

export const GET_EVENTS_AND_DISCUSSIONS_BY_TAG = gql`
query getEventsByTag($tag: String!) {
  queryTag ( filter: {
    text: { 
      anyofterms: $tag
    }
  }){
      Events {
        id
        title
        startTime
        locationName
        address
        virtualEventUrl
        Organizer {
          username
        }
        Communities {
          url
        }
        Tags {
          text
        }
      }
      Discussions {
        id
        title
        body
        Author {
          username
        }
        Communities {
          url
        }
        Tags {
          text
        }
        CommunitiesAggregate {
        count
      }
      CommentSections {
        id
        CommentsAggregate {
          count
        }
        Discussion {
          id
        }
        Event {
          id
        }
        Community {
          url
        }
      }
      }
  }
}
`
