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

export const GET_MOD_DOWNVOTED_COMMENTS = gql`
query getModDownvotedComments($displayName: String!) {
  moderationProfiles(
    where: {displayName: $displayName}
  ) {
    displayName
    DownvotedComments {
      id
      text
      createdAt
      updatedAt
      deleted
      CommentAuthor {
        ... on User {
          username
        }
      }
      Channel {
        uniqueName
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
    }
  }
}`

export const GET_MOD_DOWNVOTED_DISCUSSIONS = gql`
query getModDownvotedDiscussions($displayName: String!) {
  moderationProfiles(
    where: {displayName: $displayName}
  ) {
    displayName
    DownvotedDiscussions {
      id
      title
      body
      createdAt
      updatedAt
      deleted
      Channel {
        uniqueName
      }
    }
  }
}
`

export const GET_FEEDBACK_BY_MOD_PROFILE = gql`
query getFeedbackByModProfile {
  moderationProfiles(
    where: {
      displayName: "miniatureDeafeningMysteriousTeacher"
    }
  ) {
    displayName
    
    AuthoredComments {
      Channel {
        uniqueName
      }
      text
      GivesFeedbackOnDiscussion {
        title
      }
      GivesFeedbackOnComment {
        text
      }
      GivesFeedbackOnEvent {
        title
      }
    }
  }
}
`