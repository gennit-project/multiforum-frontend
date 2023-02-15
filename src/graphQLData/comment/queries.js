import { gql } from '@apollo/client/core'

export const GET_COMMENT_SECTION = gql`
  query getCommentSection($id: ID!) {
      commentSections (
        where: { 
          id: $id
        }
      ) {
      id
      Channel {
        uniqueName
      }
      OriginalPost {
        ... on Discussion {
          id
          title
          Author {
            username
          }
        }
      }
      CommentsAggregate {
        count
      }
      Comments (where: {
        isRootComment: true
      }){
            id
            text
            Channel {
              uniqueName
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
            CommentAuthor {
              ... on User {
                username
              }
            }
            createdAt
            updatedAt
            ChildCommentsAggregate {
              count
            }
            ChildComments {
              id 
              text
              CommentAuthor {
                ... on User {
                  username
                }
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
              ChildCommentsAggregate {
                count
              }
            }
      }
    }
}
`

// Used for comment permalink page
export const GET_COMMENT_AND_REPLIES = gql`
query getCommentWithReplies($id: ID!){
	comments(where: {
		id: $id
	}){
    id
    text
    CommentAuthor {
      ... on User {
        username
      }
    }
    createdAt
    updatedAt
    ChildCommentsAggregate {
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
      createdAt
    }
    DownvotedByModeratorsAggregate {
      count
    }
		ChildComments {
			id
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
      CommentAuthor {
        ... on User {
          username
        }
      }
			text
      ParentComment {
        id
      }
      ChildCommentsAggregate {
        count
      }
		}
	}
}
`

export const GET_COMMENT_REPLIES = gql`
query getCommentWithReplies($id: ID!){
	comments(where: {
		id: $id
	}){
    id
    ChildCommentsAggregate {
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
		ChildComments {
			id
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
      CommentAuthor {
        ... on User {
          username
        }
      }
			text
      ParentComment {
        id
      }
      ChildCommentsAggregate {
        count
      }
		}
	}
}
`