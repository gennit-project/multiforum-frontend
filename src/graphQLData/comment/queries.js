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
      CommentsConnection(where: {
        node: {
          isRootComment: true
        }
      }){
        edges {
          node {
            id
            text
            CommentAuthor {
              ... on User {
                username
              }
            }
            createdAt
            updatedAt
          }
        }
      }
    }
}
`
