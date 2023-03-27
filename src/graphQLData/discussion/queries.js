import { gql } from "@apollo/client/core";

// get discussion by ID
export const GET_DISCUSSION = gql`
  query getDiscussion($id: ID!) {
    discussions(where: { id: $id }) {
      id
      title
      body
      createdAt
      updatedAt
      Author {
        username
      }
      Channels {
        uniqueName
      }
      Tags {
        text
      }
      UpvotedByUsers {
        username
      }
      UpvotedByUsersAggregate {
        count
      }
      DownvotedByModerators {
        displayName
      }
      DownvotedByModeratorsAggregate {
        count
      }
      CommentSections {
        id
        __typename
        Channel {
          uniqueName
        }
        CommentsAggregate {
          count
        }
        UpvotedByUsers {
          username
        }
        UpvotedByUsersAggregate {
          count
        }
        DownvotedByModerators {
          displayName
        }
        DownvotedByModeratorsAggregate {
          count
        }
        OriginalPost {
          ... on Discussion {
            id
            title
          }
        }
      }
    }
  }
`;
