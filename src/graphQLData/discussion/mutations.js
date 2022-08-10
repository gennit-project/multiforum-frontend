import { gql } from "@apollo/client/core";

export const CREATE_DISCUSSION = gql`
  mutation createDiscussion(
    $createDiscussionInput: [DiscussionCreateInput!]!
  ) {
    createDiscussions(input: $createDiscussionInput) {
      discussions {
        id
        title
        body
        Channels {
          uniqueName
        }
        Author {
          username
        }
        createdAt
        updatedAt
        Tags {
          text
        }
      }
    }
  }
`;

export const UPDATE_DISCUSSION = gql`
  mutation updateDiscussion(
    $updateDiscussionInput: DiscussionUpdateInput
    $discussionWhere: DiscussionWhere
  ) {
    updateDiscussions(
      update: $updateDiscussionInput
      where: $discussionWhere
    ) {
      discussions {
        id
        title
        body
        Channels {
          uniqueName
        }
        Author {
          username
        }
        createdAt
        updatedAt
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


