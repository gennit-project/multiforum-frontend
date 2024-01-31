import { gql } from "@apollo/client/core";

export const REPORT_DISCUSSION = gql`
mutation reportDiscussion(
  $title: String!
  $body: String!
  $relatedDiscussionId: ID!
  $authorName: String!
  $channelUniqueName: String!
) {
  reportDiscussion(
    title: $title,
    body: $body,
    relatedDiscussionId: $relatedDiscussionId,
    authorName: $authorName,
    channelUniqueName: $channelUniqueName
  ) {
    authorName
    Author {
      ... on ModerationProfile {
        displayName
      }
    }
    title
    body
    channelUniqueName
    Channel {
      uniqueName
    }
    relatedDiscussionId
    RelatedDiscussion {
      id 
      title
    }
  }
}
`

export const REPORT_EVENT = gql`
mutation reportEvent(
  $title: String!
  $body: String!
  $relatedEventId: ID!
  $authorName: String!
  $channelUniqueName: String!
) {
  reportEvent(
    title: $title,
    body: $body,
    relatedEventId: $relatedEventId,
    authorName: $authorName,
    channelUniqueName: $channelUniqueName
  ) {
    authorName
    Author {
      ... on ModerationProfile {
        displayName
      }
    }
    title
    body
    channelUniqueName
    Channel {
      uniqueName
    }
    relatedDiscussionId
    RelatedDiscussion {
      id 
      title
    }
  }
}
`

export const REPORT_COMMENT = gql`
mutation reportComment(
  $title: String!
  $body: String!
  $relatedCommentId: ID!
  $authorName: String!
  $channelUniqueName: String!
) {
  reportComment(
    title: $title,
    body: $body,
    relatedCommentId: $relatedCommentId,
    authorName: $authorName,
    channelUniqueName: $channelUniqueName
  ) {
    authorName
    Author {
      ... on ModerationProfile {
        displayName
      }
    }
    title
    body
    channelUniqueName
    Channel {
      uniqueName
    }
    relatedDiscussionId
    RelatedDiscussion {
      id 
      title
    }
  }
}
`