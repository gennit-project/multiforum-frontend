import { gql } from '@apollo/client/core';

export const GET_MOD = gql`
  query getMod($displayName: String!) {
    moderationProfiles(where: {
      displayName: $displayName
    }) {
      displayName
      createdAt
      DownvotedCommentsAggregate {
        count
        __typename
      }
      DownvotedDiscussionsAggregate {
        count
        __typename
      }
      AuthoredReportsAggregate {
        count
        __typename
      } 
    }
  }`