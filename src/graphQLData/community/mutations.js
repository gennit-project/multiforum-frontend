import { gql } from "@apollo/client/core";

export const ADD_COMMUNITY = gql`
  mutation addCommunity(
    $url: String!
    $name: String!
    $description: String
    $username: String!
  ) {
    addCommunity(
      input: [
        {
          description: $description
          name: $name
          url: $url
          Organizers: [{ username: $username }]
        }
      ]
    ) {
      community {
        description
        name
        url
        Organizers {
          username
        }
      }
    }
  }
`;


export const DELETE_COMMUNITY = gql`
  mutation deleteCommunity($url: String!) {
    deleteCommunity(filter: { url: { eq: $url } }) {
      community {
        url
      }
    }
  }
`;

export const UPDATE_COMMUNITY = gql`
  mutation updateCommunity($url: String!, $name: String, $description: String) {
    updateCommunity(
      input: {
        filter: { url: { eq: $url } }
        set: { name: $name, description: $description }
      }
    ) {
      community {
        url
        name
        description
      }
    }
  }
`;

export const ADD_COMMUNITY_TAG = gql`
  mutation updateCommunity(
      $url: String!,
      $text: String!, # text of the tag
    ) {
    updateCommunity(
      input: { 
        filter: { 
          url: [$url] 
        }, 
        set: { 
          Tags: [{
            text: $text,
          }]
        }
      }
    ) {
      community {
        url
        name
        description
        Tags {
          text
        }
      }
    }
}`;



export const REMOVE_COMMUNITY_TAG = gql`
  mutation updateCommunity (
      $url: String!,
      $text: String!
    ) {
      updateCommunity(
        input: {
          filter: {
            id: [$commentId]
          }
          remove: { 
            Tags: {
              text: $text
            } 
          }
      }){
          community {
            url
            name
            description
            Tags {
              text
            }
          }
      }
  }
`