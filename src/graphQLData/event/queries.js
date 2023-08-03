import { gql } from "@apollo/client/core";

// Fragment for shared event fields
const EVENT_FIELDS = gql`
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
    canceled
    location {
      latitude
      longitude
    }
    cost
    Poster {
      username
    }
    Tags {
      text
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
    events(where: {id: $id}) {
      ...EventFields
      createdAt
      updatedAt
      placeId
      isInPrivateResidence
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
  query getEvents(
    $where: EventWhere
    $resultsOrder: [EventSort!]
    $offset: Int
    $limit: Int
  ) {
    eventsAggregate(where: $where) {
      count
    }
    events(
      where: $where
      options: { sort: $resultsOrder, offset: $offset, limit: $limit }
    ) {
      id
    title
    description
    startTime
    endTime
    locationName
    address
    virtualEventUrl
    startTimeDayOfWeek
    canceled
    location {
      latitude
      longitude
    }
    cost
    Poster {
      username
    }
    Tags {
      text
    }
    EventChannels {
      id
      eventId
      channelUniqueName

    }
    }
  }
`;
