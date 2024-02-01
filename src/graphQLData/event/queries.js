import { gql } from "@apollo/client/core";
import { AUTHOR_FIELDS } from "../discussion/queries";

// Fragment for shared event fields
export const EVENT_FIELDS = gql`
  fragment EventFields on Event {
    id
    title
    description
    startTime
    endTime
    locationName
    address
    virtualEventUrl
    startTimeDayOfWeek
    startTimeHourOfDay
    canceled
    isHostedByOP
    isAllDay
    coverImageURL
    createdAt
    updatedAt
    placeId
    isInPrivateResidence
    RecurringEvent {
      id
      repeatEvery {
        count
        unit
      }
      repeatEnds {
        type
        count
        until
      }
    }
    location {
      latitude
      longitude
    }
    cost
    Tags {
      text
    }
    CommentsAggregate {
      count
    }
    EventChannels {
      id
      eventId
      channelUniqueName
      Channel {
        uniqueName
      }
    }
  }
`;

// get event by ID
export const GET_EVENT = gql`
  query getEvent($id: ID!) {
    events(where: { id: $id }) {
      ...EventFields
      Poster {
        username
        createdAt
        discussionKarma
        commentKarma
      }
    }
  }
  ${EVENT_FIELDS}
`;

// Get all event IDs in channel
export const GET_EVENT_IDS_IN_CHANNEL = gql`
  query getEventIdsInChannel($url: String!) {
    getChannel(url: $url) {
      url
      Events {
        id
      }
    }
  }
`;

export const GET_EVENTS = gql`
  query getEvents($where: EventWhere, $options: EventOptions) {
    eventsAggregate(where: $where) {
      count
    }
    events(where: $where, options: $options) {
      ...EventFields
      cost
      Poster {
        ...AuthorFields
      }
      CommentsAggregate {
        count
      }
      EventChannels {
        id
        eventId
        channelUniqueName
      }
    }
  }
  ${EVENT_FIELDS}
  ${AUTHOR_FIELDS}
`;


export const GET_FEEDBACK_ON_EVENT = gql`
query getFeedbackOnEvent {
  events(
    where: {
      id: "b2bc604d-1fe6-431e-b200-95cc9d882597"
    }
  ) {
    title
    FeedbackComments {
      text
      Channel {
        uniqueName
      }
      CommentAuthor {
        ... on ModerationProfile {
          displayName
        }
      }
    }
  }
}

`