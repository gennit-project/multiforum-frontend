import { gql } from "@apollo/client/core";

export const CREATE_COMMENT = gql`
  mutation createComment(
    $createCommentInput: [CommentCreateInput!]!
  ){
    createComments(input: $createCommentInput) {
      comments {
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
  }`

export const CREATE_COMMENT_SECTION = gql`
mutation createDiscussion(
    $createCommentSectionInput: [CommentSectionCreateInput!]!
  ){
	createCommentSections(
		input: $createCommentSectionInput
	){
		commentSections {
			id
			OriginalPost {
				... on Discussion {
				  id
				  title
		  	}
			}
      Comments {
        id
      }
			Channel {
				uniqueName
			}
		}
	}
}
`;