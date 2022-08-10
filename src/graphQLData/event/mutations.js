import { gql } from "@apollo/client/core";



// Update event
export const UPDATE_EVENT = gql`
      mutation ($updateEventInput: EventUpdateInput, $eventWhere: EventWhere) {
        updateEvents(update: $updateEventInput, where: $eventWhere) {
          events {
            id
            title
            description
            Channels {
              uniqueName
            }
            Poster {
              username
            }
            locationName
            address
            startTime
            startTimeYear
            startTimeMonth
            startTimeDayOfMonth
            startTimeDayOfWeek
            startTimeHourOfDay
            endTime
            virtualEventUrl
            createdAt
            isInPrivateResidence
            cost
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

export const ADD_EVENT_TAG = gql`
  mutation updateEvent(
      $id: ID!,       # Event ID
      $text: String!, # text of the tag
    ) {
    updateEvent(
      input: { 
        filter: { 
          id: [$id] 
        }, 
        set: { 
          Tags: [{
            text: $text,
          }]
        }
      }
    ) {
      event {
        id
        title
        Tags {
          text
        }
      }
    }
}`;



export const REMOVE_EVENT_TAG = gql`
  mutation updateEvent (
      $id: ID!,
      $text: String!
    ) {
      updateEvent(
        input: {
          filter: {
            id: [$id]
          }
          remove: { 
            Tags: {
              text: $text
            } 
          }
      }){
        event {
          id
          title
          Tags {
            text
          }
        }
      }
  }
`