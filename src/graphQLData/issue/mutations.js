import { gql } from "@apollo/client/core";

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
        Comments {
          id
          text
          CommentAuthor {
            ... on ModerationProfile {
              displayName
            }
          }
        }
      }
    }
  }
`;

export const CLOSE_ISSUE = gql`
mutation closeIssue($id: ID!) {
  updateIssues (
    where: {
      id: $id
    },
    update: {
      isOpen: false
    }
  ) {
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
  updateIssues (
    where: {
      id: $id
    },
    update: {
      isOpen: true
    }
  ) {
    issues {
      id 
      title
      isOpen
    }
  }
}
`;

export const ADD_ISSUE_COMMENT = gql`
  mutation addIssueComment(
    $displayName: String!
    $text: String!
    $issueId: ID!
  ) {
    updateIssues(
      where: { id: $issueId }
      create: {
        Comments: [
          {
            node: {
              text: $text
              isRootComment: true
              CommentAuthor: {
                ModerationProfile: {
                  connect: { where: { node: { displayName: $displayName } } }
                }
              }
            }
          }
        ]
      }
    ) {
      issues {
        id
        Comments {
          id
          text
          isRootComment
          CommentAuthor {
            ... on ModerationProfile {
              displayName
            }
          }
        }
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
