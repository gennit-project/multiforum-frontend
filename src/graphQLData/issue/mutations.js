import { gql } from "@apollo/client/core";
import { ISSUE_FIELDS } from "./queries";

export const REPORT_DISCUSSION = gql`
  mutation reportDiscussion($input: [IssueCreateInput!]!) {
    createIssues(input: $input) {
      issues {
        title
        relatedDiscussionId
        channelUniqueName
        Author {
          ... on ModerationProfile {
            displayName
          }
        }
        Channel {
          uniqueName
        }
      }
    }
  }
`;

export const CLOSE_ISSUE = gql`
  mutation closeIssue($id: ID!) {
    updateIssues(where: { id: $id }, update: { isOpen: false }) {
      issues {
        id
        title
        isOpen
      }
    }
  }
`;

export const REOPEN_ISSUE = gql`
  mutation reopenIssue($id: ID!) {
    updateIssues(where: { id: $id }, update: { isOpen: true }) {
      issues {
        id
        title
        isOpen
      }
    }
  }
`;

export const ADD_ISSUE_ACTIVITY_FEED_ITEM = gql`
  ${ISSUE_FIELDS}
  mutation addIssueActivityFeedItem(
    $issueId: ID!
    $actionDescription: String!
    $actionType: String!
    $displayName: String!
  ) {
    updateIssues(
      where: { id: $issueId }
      create: {
        ActivityFeed: [
          {
            node: {
              actionDescription: $actionDescription
              actionType: $actionType
              ModerationProfile: {
                connect: { where: { node: { displayName: $displayName } } }
              }
            }
          }
        ]
      }
    ) {
      issues {
        ...IssueFields
      }
    }
  }
`;

export const ADD_ISSUE_ACTIVITY_FEED_ITEM_WITH_COMMENT = gql`
  ${ISSUE_FIELDS}
  mutation addIssueActivityFeedItemWithComment(
    $issueId: ID!
    $actionDescription: String!
    $actionType: String!
    $displayName: String!
    $commentText: String!
  ) {
    updateIssues(
      where: { id: $issueId }
      create: {
        ActivityFeed: [
          {
            node: {
              actionDescription: $actionDescription
              actionType: $actionType
              ModerationProfile: {
                connect: { where: { node: { displayName: $displayName } } }
              }
              Comment: {
                create: {
                  node: {
                    isRootComment: false
                    text: $commentText
                    CommentAuthor: {
                      ModerationProfile: {
                        connect: {
                          where: { node: { displayName: $displayName } }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      }
    ) {
      issues {
        ...IssueFields
      }
    }
  }
`;

export const REPORT_EVENT = gql`
  mutation reportEvent(
    $title: String!
    $body: String!
    $relatedEventId: ID!
    $authorName: String!
    $channelUniqueName: String!
  ) {
    reportEvent(
      title: $title
      body: $body
      relatedEventId: $relatedEventId
      authorName: $authorName
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
    }
  }
`;

export const REPORT_COMMENT = gql`
  mutation reportComment(
    $title: String!
    $body: String!
    $relatedCommentId: ID!
    $authorName: String!
    $channelUniqueName: String!
  ) {
    reportComment(
      title: $title
      body: $body
      relatedCommentId: $relatedCommentId
      authorName: $authorName
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
    }
  }
`;
