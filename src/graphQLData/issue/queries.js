import { AUTHOR_FIELDS } from "../discussion/queries";
import { gql } from "@apollo/client/core";

export const ISSUE_FIELDS = gql`
  ${AUTHOR_FIELDS}
  fragment IssueFields on Issue {
    id
    title
    body
    isOpen
    createdAt
    updatedAt
    relatedCommentId
    relatedDiscussionId
    relatedEventId
    Author {
      ...AuthorFields
    }
  }
`;

export const GET_ISSUE = gql`
  ${ISSUE_FIELDS}
  query getIssue($id: ID!) {
    issues(where: { id: $id }) {
      ...IssueFields
    }
  }
`;


export const GET_ISSUES_BY_DISCUSSION = gql`
query getIssuesByDiscussion(
  $discussionId: ID!
) {
  discussions (
    where: {
      id: $discussionId
    }
  ) {
    id 
    title
    RelatedIssues {
      title
      Author {
        ... on ModerationProfile {
          displayName
        }
      }
    }
  }
}`


export const GET_ISSUES_BY_CHANNEL = gql`
query getIssuesByChannel(
  $channelUniqueName: String!
) {
  channels (
    where: {
      uniqueName: $channelUniqueName
    } 
  ) {
    uniqueName
    Issues {
      id
      title
      Author {
        ... on ModerationProfile {
          displayName
        }
      }
      createdAt
      updatedAt
      isOpen
    }
  }
}
`

export const GET_ISSUES_BY_MOD = gql`
query getIssuesByMod {
  moderationProfiles(
    where: {
      displayName: "miniatureDeafeningMysteriousTeacher"
    }
  ) {
    displayName
    AuthoredIssues {
      title
    }
  }
}`

export const GET_ISSUES_BY_SERVER = gql`
query getIssues {
  issues {
    id
    title
    authorName
    Author {
      ... on ModerationProfile {
        displayName
      }
    }
    relatedDiscussionId
    RelatedDiscussion {
      title
    }
    channelUniqueName
    Channel {
      uniqueName
    }

  }
}
`

export const GET_ISSUES_BY_EVENT = gql`
query getIssuesByEvent {
  events (
    where: {
      id: "d081532a-8f07-48ed-8786-40e8dcc309c2"
    }
  ) {
    id 
    title
    RelatedIssues {
      title
      Author {
        ... on ModerationProfile {
          displayName
        }
      }
    }
  }
}
`

export const GET_ISSUES_BY_COMMENT = gql`
query getIssuesByComment {
  comments (
    where: {
      id: "cc153e03-62a4-41fa-9597-46e6795e7fc3"
    }
  ) {
    id 
    text
    RelatedIssues {
      title
      Author {
        ... on ModerationProfile {
          displayName
        }
      }
    }
  }
}
`