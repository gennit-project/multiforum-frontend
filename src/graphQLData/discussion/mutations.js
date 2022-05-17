import { gql } from "@apollo/client/core";

// Update discussion
export const UPDATE_DISCUSSION = gql`
  mutation updateDiscussion(
    $id: ID!, 
    $title: String, 
    $body: String,
    $editedDate: DateTime
    $Channels: [ChannelRef!]
    $Tags: [TagRef!]
  ) {
    updateDiscussion(
      input: { 
        filter: { 
          id: [$id] 
        }, 
        set: { 
          title: $title, 
          body: $body 
          editedDate: $editedDate
          Channels: $Channels
          Tags: $Tags
        }
      }
    ) {
      discussion {
        id
        title
        body
        createdDate
        editedDate
        Channels {
          url
        }
        Tags {
          text
        }
      }
    }
  }
`;


export const DELETE_DISCUSSION = gql`
  mutation deleteDiscussion($id: ID!) {
      deleteDiscussions(
        where: {
          id: $id
        }
    ) {
      nodesDeleted
      relationshipsDeleted    
    }
  }
`;


export const ADD_DISCUSSION_TAG = gql`
  mutation updateDiscussion(
      $id: ID!,       # Discussion ID
      $text: String!, # text of the tag
    ) {
    updateDiscussion(
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
      discussion {
        id
        title
        Tags {
          text
        }
      }
    }
}`;



export const REMOVE_DISCUSSION_TAG = gql`
  mutation updateDiscussion (
      $id: ID!,
      $text: String!
    ) {
      updateDiscussion(
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
        discussion {
          id
          title
          Tags {
            text
          }
        }
      }
  }
`