import { gql } from '@apollo/client/core';

// get discussion by ID
export const GET_DISCUSSION = gql`
  query getDiscussion($id: ID!) {
    getDiscussion(id: $id) {
      id
      title
      body
      createdDate
      editedDate
      Author {
        username
      }
      Communities {
        url
      }
      Tags {
        text
      }
    }
  }
`;

// Get all discussion IDs in community
// Gets IDs of discussions just so they can be
// deleted when a community is deleted. This query
// is needed because you can't cascade delete communities.
export const GET_DISCUSSION_IDS_IN_COMMUNITY = gql`
  query getDiscussionIdsInCommunity($url: String!) {
    getCommunity(url: $url) {
      url
      Discussions {
        id
      }
    }
  }
`;

// Get all discussions in a community
export const GET_DISCUSSIONS_IN_COMMUNITY = gql`
  query getDiscussionsInCommunity($url: String!) {
    getCommunity (url: $url) {
      url
      Discussions {
        id
        title
        body
        Communities {
          url
        }
        Author {
          username
        }
        Tags {
          text
        }
        createdDate
        CommentSections {
          CommentsAggregate {
            count
          }
        }
      }
    }
  }
`;
