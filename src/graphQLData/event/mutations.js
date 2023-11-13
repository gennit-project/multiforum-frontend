import { gql } from "@apollo/client/core";
import { EVENT_FIELDS } from "./queries";

export const CREATE_EVENT_WITH_CHANNEL_CONNECTIONS = gql`
  mutation createEvent(
    $eventCreateInput: EventCreateInput
    $channelConnections: [String]
  ) {
    createEventWithChannelConnections(
      eventCreateInput: $eventCreateInput
      channelConnections: $channelConnections
    ) {
      ...EventFields
      EventChannels {
        id
        Channel {
          uniqueName
        }
      }
      Poster {
        username
      }
      Tags {
        text
      }
    }
  }
  ${EVENT_FIELDS}
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
      ...EventFields
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
      Tags {
        text
      }
    }
  }
  ${EVENT_FIELDS}
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