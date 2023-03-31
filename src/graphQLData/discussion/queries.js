import { gql } from "@apollo/client/core";


export const GET_DISCUSSIONS_WITH_COMMENT_SECTION_DATA = gql`
query getDiscussions(
  $channelId: String
  $where: DiscussionWhere
  $resultsOrder: [DiscussionSort!]
  $offset: Int
  $limit: Int
) {
  discussionsAggregate(where: $where) {
    count
  }
  discussions(
    where: $where
    options: { sort: $resultsOrder, offset: $offset, limit: $limit }
  ) {
    id
    Channels {
      uniqueName
    }
    title
    body
    createdAt
    Author {
      username
    }
    Tags {
      text
    }
    ChannelsAggregate {
      count
    }
   
    UpvotedByUsers {
      username
    }
    UpvotedByUsersAggregate {
      count
    }
    DownvotedByModeratorsAggregate {
      count
    }
    DownvotedByModerators {
      displayName
    }
    CommentSections(where: { Channel: { uniqueName: $channelId } }) {
      id
      __typename
      
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
      OriginalPost {
        ... on Discussion {
          id
          title
        }
      }
    }
  }
}
`;

// get discussion by ID
export const GET_DISCUSSION = gql`
  query getDiscussion($id: ID!) {
    discussions(where: { id: $id }) {
      id
      title
      body
      createdAt
      updatedAt
      Author {
        username
      }
      Channels {
        uniqueName
      }
      Tags {
        text
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
      CommentSections {
        id
        __typename
        Channel {
          uniqueName
        }
        CommentsAggregate {
          count
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
        OriginalPost {
          ... on Discussion {
            id
            title
          }
        }
      }
    }
  }
`;
