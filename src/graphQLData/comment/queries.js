import { gql } from "@apollo/client/core";

export const GET_COMMENT_BY_ID_WITH_REPLIES = gql`
  query getCommentByIdWithReplies($id: ID!) {
    getComment(id: $id) {
      id
      UserAuthor {
        username
      }
      text
      ChildComments {
        id
        UserAuthor {
          username
        }
        text
      }
      authorIsAdmin
      authorIsModerator
      authorIsOrganizer
      authorIsOriginalPoster
      deleted
      createdDate
      editedDate
      Tags {
        text
      }
      Emoji {
        id
        identifier
        name
        native
        colons
        addedBy {
          username
        }
      }
    }
  }
`;

// Get all comment IDs in community
// Gets IDs of comments just so they can be
// deleted when a community or discussion is deleted. This query
// is needed because you can't cascade delete communities.
export const GET_COMMENT_IDS_IN_COMMUNITY = gql`
  query queryCommentIds($url: String!) {
    getCommunity(url: $url) {
      url
      Comments {
        id
      }
    }
  }
`;
// Get all comment IDs in event
// so that the comments can be deleted
// when the event is deleted. This query
// is needed because you can't cascade
// delete.
export const GET_COMMENT_IDS_IN_EVENT = gql`
  query getEvent($eventId: ID!) {
    getEvent(id: $eventId) {
      id
      Comments {
        id
      }
    }
  }
`;

export const GET_COMMENT_SECTION = gql`
  query getCommentSection($id: String!) {
    getCommentSection(id: $id) {
      id
      Discussion {
        id
      }
      Event {
        id
      }
      Comments {
        id
        CommentSection {
          id
        }
        isRootComment
        ParentComment {
          id
        }
        UserAuthor {
          username
        }
        text
        Community {
          url
        }
        authorIsAdmin
        authorIsModerator
        authorIsOrganizer
        authorIsOriginalPoster
        deleted
        createdDate
        editedDate
        Tags {
          text
        }
        Emoji {
          id
          identifier
          name
          native
          colons
          addedBy {
            username
          }
        }
      }
    }
  }
`;
