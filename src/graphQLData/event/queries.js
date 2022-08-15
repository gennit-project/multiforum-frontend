import { gql } from "@apollo/client/core";

// get event by ID
export const GET_EVENT = gql`
  query getEvent($id: ID!) {
    events(where: {id: $id}) {
      id
      title
      createdAt
      updatedAt
      description
      startTime
      endTime
      locationName
      address
      placeId
      Poster {
        username
      }
      location {
        longitude
        latitude
      }
      cost
      free
      virtualEventUrl
      canceled
      Channels {
        uniqueName
      }
      Tags {
        text
      }
    }
  }
`;
// Get all event IDs in channel
// Gets IDs of events just so they can be
// deleted when a channel is deleted. This query
// is needed because you can't cascade delete channels.
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

// Get all events in a channel
export const GET_EVENTS_IN_CHANNEL = gql`
  query getEventsInChannel($url: String!) {
    getChannel(url: $url) {
      url
      Events {
        id
        title
        Channels {
          url
        }
        Poster {
          username
        }
        startTime
        endTime
        virtualEventUrl
        locationName
        address
        cost
        free
        placeId
        canceled
        location {
          latitude
          longitude
        }
      }
    }
  }
`;
