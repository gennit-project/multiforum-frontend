import { gql } from '@apollo/client/core';

// This gets a reactive variable in the Apollo cache.
export const GET_LOCAL_USERNAME = gql`
  query getLocalUsername {
    username @client
  }
`

export const GET_LOCAL_MOD_PROFILE_NAME = gql`
  query getLocalModProfileName {
    modProfileName @client
  }
`

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
    users(
      where: {username: $username}
    ) {
      username
      createdAt
      name
      location
      pronouns
      bio
      isAdmin
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

export const GET_USER_COMMENTS = gql`
  query getUserComments($username: String!) {
    users(
      where: {username: $username}
    ) {
      username
      Comments {
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
        DiscussionChannel {
          id
          Channel {
            uniqueName
          }
        }
        Channel {
          uniqueName
        }
        UpvotedByUsersAggregate {
          count
        }
        UpvotedByUsers {
          username
        }
        DownvotedByModeratorsAggregate {
          count
        }
        DownvotedByModerators {
          displayName
        }
      }
    }
  }`

export const GET_USER_DISCUSSIONS = gql`
  query getUserDiscussions($username: String!) {
    users(
      where: {username: $username}
    ) {
      username
      Discussions {
        id
        Author {
          username
        }
        title
        body
        createdAt
        updatedAt
        deleted
        DiscussionChannels {
          Channel {
            uniqueName
          }
        }
        Tags {
          text
        }
      }
    }
  }`

export const GET_USER_EVENTS = gql`
  query getUserEvents($username: String!) {
    users(
      where: {username: $username}
    ) {
      username
      Events {
        id
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
        createdAt
        updatedAt
        deleted
        EventChannels {
          Channel {
            uniqueName
          }
        }
      }
    }
  }`

export const DOES_USER_EXIST = gql`
  query doesUserExist($username: String!) {
    users(where: {
      username: $username
    }) {
      username
      Email {
        address
      }
    }
  }
`

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
        DiscussionChannels {
          id
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
        EventChannels {
          Channel {
            uniqueName
          }
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
        DiscussionChannels {
          id
          CommentsAggregate {
            count
          }
          Discussion {
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