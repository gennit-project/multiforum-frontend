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
              ChildCommentsAggregate {
                count
              }
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
		ChildComments {
			id
      UpvotedByUsers {
        username
      }
      UpvotedByUsersAggregate {
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
      UpvotedByUsers {
        username
      }
		}
	}
}
`