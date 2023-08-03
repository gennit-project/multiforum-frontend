import { gql } from "@apollo/client/core";

export const CREATE_EVENT_WITH_CHANNEL_CONNECTIONS = gql`
  mutation createEvent(
    $eventCreateInput: EventCreateInput
    $channelConnections: [String]
  ) {
    createEventWithChannelConnections(
      eventCreateInput: $eventCreateInput
      channelConnections: $channelConnections
    ) {
      id
      title
      description
      EventChannels {
        id
        Channel {
          uniqueName
        }
      }
      Poster {
        username
      }
      createdAt
      updatedAt
      Tags {
        text
      }
    }
  }
`;

export const UPDATE_EVENT_WITH_CHANNEL_CONNECTIONS = gql`
  mutation updateEvents(
    $updateEventInput: EventUpdateInput!
    $eventWhere: EventWhere!
    $channelConnections: [String!]!
    $channelDisconnections: [String!]!
  ) {
    updateEventWithChannelConnections(
      eventUpdateInput: $updateEventInput
      eventWhere: $eventWhere
      channelConnections: $channelConnections
      channelDisconnections: $channelDisconnections
    ) {
      id
      title
      description
      EventChannels {
        id
        channelUniqueName
        eventId
        Channel {
          uniqueName
        }
      }
      Poster {
        username
      }
      createdAt
      updatedAt
      Tags {
        text
      }
    }
  }
`;

export const CREATE_EVENT = gql`
mutation ($createEventInput: [EventCreateInput!]!) {
  createEvents(input: $createEventInput) {
    events {
      id
      title
      description
      EventChannels {
        Channel {
          uniqueName
        }
      }
      Poster {
        username
      }
      locationName
      address
      startTime
      startTimeDayOfWeek
      startTimeHourOfDay
      endTime
      virtualEventUrl
      createdAt
      isInPrivateResidence
      cost
      free
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
}
`;


// Update event
export const UPDATE_EVENT = gql`
  mutation ($updateEventInput: EventUpdateInput, $eventWhere: EventWhere) {
    updateEvents(update: $updateEventInput, where: $eventWhere) {
      events {
        id
        title
        description
        EventChannels {
          Channel {
            uniqueName
          }
        }
        Poster {
          username
        }
        locationName
        address
        startTime
        startTimeDayOfWeek
        startTimeHourOfDay
        endTime
        virtualEventUrl
        createdAt
        isInPrivateResidence
        cost
        free
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
  }
`;

export const CANCEL_EVENT = gql`
  mutation ($updateEventInput: EventUpdateInput, $eventWhere: EventWhere) {
    updateEvents(update: $updateEventInput, where: $eventWhere) {
      events {
        id
        canceled
      }
    }
  }
`;


export const DELETE_EVENTS = gql`
  mutation deleteEvent($id: [ID!]) {
    deleteEvent(filter: { id: $id }) {
      event {
        id
      }
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation deleteEvent($id: ID!) {
      deleteEvents(
        where: {
          id: $id
        }
    ) {
      nodesDeleted
      relationshipsDeleted    
    }
  }
`;