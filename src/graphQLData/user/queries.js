import { gql } from '@apollo/client/core';

export const GET_USER_INFO_FOR_TAGS = gql`
  query getUser($username: String!) {
    getUser(username: $username) {
      isAdmin
      PosterOfChannels {
        url
      }
      ModeratorOfChannels {
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
      ModeratorOfChannels {
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
      ModeratorOfChannels {
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
        Channel {
          url
        }
        authorIsAdmin
        authorIsModerator
        authorIsPoster
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
        Channels {
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
        Poster {
          username
        }
        Tags {
          text
        }
      }
      Discussions {
        id
        Channels {
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
        ChannelsAggregate {
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
          Channel {
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