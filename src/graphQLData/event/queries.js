import { gql } from "@apollo/client/core";

export const GET_ALL_EVENTS = gql`
  query getEvents {
    queryEvent {
      id
      title
      description
      startTime
      startTimeYear
      startTimeMonth
      startTimeDayOfMonth
      startTimeDayOfWeek
      startTimeHourOfDay
      endTime
      locationName
      virtualEventUrl
      address
      cost
      canceled
      Tags {
        text
      }
      Communities {
        url
      }
      Organizer {
        username
      }
      placeId
      location {
        latitude
        longitude
      }
      Comments {
        id
        UserAuthor {
          username
        }
        text
      }
    }
  }
`;

// get event by ID
export const GET_EVENT = gql`
  query getEvent($id: ID!) {
    getEvent(id: $id) {
      id
      title
      description
      startTime
      startTimeYear
      startTimeMonth
      startTimeDayOfMonth
      startTimeDayOfWeek
      startTimeHourOfDay
      endTime
      locationName
      virtualEventUrl
      address
      cost
      Communities {
        url
      }
      Organizer {
        username
      }
      placeId
      location {
        latitude
        longitude
      }
      canceled
      Tags {
        text
      }
    }
  }
`;
// Get all event IDs in community
// Gets IDs of events just so they can be
// deleted when a community is deleted. This query
// is needed because you can't cascade delete communities.
export const GET_EVENT_IDS_IN_COMMUNITY = gql`
  query getEventIdsInCommunity($url: String!) {
    getCommunity(url: $url) {
      url
      Events {
        id
      }
    }
  }
`;

// Get all events in a community
export const GET_EVENTS_IN_COMMUNITY = gql`
  query getEventsInCommunity($url: String!) {
    getCommunity(url: $url) {
      url
      Events {
        id
        title
        Communities {
          url
        }
        Organizer {
          username
        }
        startTime
        endTime
        virtualEventUrl
        locationName
        address
        cost
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
