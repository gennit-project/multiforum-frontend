import { gql } from '@apollo/client/core';

export const GET_USER_INFO_FOR_TAGS = gql`
  query getUser($username: String!) {
    getUser(username: $username) {
      isAdmin
      OrganizerOfCommunities {
        url
      }
      ModeratorOfCommunities {
        url
      }
    }
  }
`;

export const GET_USER = gql`
  query getBasicUserInfo($username: String!) {
    getUser(username: $username) {
      username
      name
      location
      pronouns
      bio
      isAdmin
      ModeratorOfCommunities {
        url
      }
      CommentsAggregate {
        count
      }
      DiscussionsAggregate {
        count
      }
      EventsAggregate {
        count
      }
    }
}`;

export const USER_LOOKUP = gql`
  query getUser($username: String!) {
    getUser(username: $username) {
      username
      name
      location
      pronouns
      bio
      isAdmin
      ModeratorOfCommunities {
        url
      }
      CommentsAggregate {
        count
      }
      DiscussionsAggregate {
        count
      }
      EventsAggregate {
        count
      }
      Comments {
        id
        CommentSection {
          id
          Event {
            id
            title
          }
          Discussion {
            id
            title
          }
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
      }
      Events {
        id
        Communities {
          url
        }
        title
        startTime
        endTime
        locationName
        address
        virtualEventUrl
        location {
          latitude
          longitude
        }
        Organizer {
          username
        }
        Tags {
          text
        }
      }
      Discussions {
        id
        Communities {
          url
        }
        title
        body
        createdDate
        Author {
          username
        }
        Tags {
          text
        }
        CommunitiesAggregate {
          count
        }
        CommentSections {
          id
          CommentsAggregate {
            count
          }
          Discussion {
            id
          }
          Event {
            id
          }
          Community {
            url
          }
        }
      }
    }
}`;

export const GET_USERS = gql`
  query {
    queryUser {
      username
    }
  }
`;