import { gql } from "@apollo/client/core";



// Update event
export const UPDATE_EVENT = gql`
  mutation updateEvent(
    $id: ID!
    $title: String
    $Channels: [ChannelRef!]
    $Tags: [TagRef!]
    $description: String
    $startTime: DateTime
    $startTimeYear: String
    $startTimeMonth: String
    $startTimeDayOfMonth: String
    $startTimeDayOfWeek: String
    $startTimeHourOfDay: Int
    $endTime: DateTime
    $locationName: String
    $address: String
    $howToFindLocation: String
    $virtualEventUrl: String
    $editedDate: DateTime
    $isInPrivateResidence: Boolean
    $cost: String
    $placeId: String
    $latitude: Float!
    $longitude: Float!
    $canceled: Boolean
  ) {
    updateEvent(
      input: {
        filter: { id: [$id] }
        set: {
          Channels: $Channels
          Tags: $Tags
          title: $title
          description: $description
          startTime: $startTime
          startTimeYear: $startTimeYear
          startTimeMonth: $startTimeMonth
          startTimeDayOfMonth: $startTimeDayOfMonth
          startTimeDayOfWeek: $startTimeDayOfWeek
          startTimeHourOfDay: $startTimeHourOfDay
          endTime: $endTime
          locationName: $locationName
          address: $address
          howToFindLocation: $howToFindLocation
          virtualEventUrl: $virtualEventUrl
          editedDate: $editedDate
          isInPrivateResidence: $isInPrivateResidence
          cost: $cost
          placeId: $placeId
          location: {
            latitude: $latitude
            longitude: $longitude
          }
          canceled: $canceled
        }
      }
    ) {
      event {
        id
        title
        description
        Channels {
          url
        }
        Tags {
          text
        }
        startTime
        startTimeYear
        startTimeMonth
        startTimeDayOfMonth
        startTimeDayOfWeek
        startTimeHourOfDay
        endTime
        locationName
        address
        howToFindLocation
        virtualEventUrl
        createdDate
        editedDate
        placeId
        isInPrivateResidence
        cost
        placeId
        location {
          latitude
          longitude
        }
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
    deleteEvent(filter: { id: [$id] }) {
      event {
        id
      }
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