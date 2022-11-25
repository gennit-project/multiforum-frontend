import { gql } from "@apollo/client/core";

export const CREATE_COMMENT = gql`
  mutation createComment(
    $createCommentInput: [CommentCreateInput!]!
  ){
    createComments(input: $createCommentInput) {
      comments {
        id
        text
        Channel {
          uniqueName
        }
        CommentAuthor {
          ... on User {
            username
          }
        }
        ParentComment {
          id
        }
        createdAt
        updatedAt
        ChildCommentsAggregate {
          count
        }
        ChildComments {
          id
          text
          createdAt
          CommentAuthor {
            ... on User {
              username
            }
          }
        }
      }
    }
  }`
  

export const CREATE_COMMENT_SECTION = gql`
mutation createCommentSection(
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
      Channel {
        uniqueName
      }
      Comments {
        id
        text
        CommentAuthor {
          ... on User {
            username
          }
        }
        ChildCommentsAggregate {
          count
        }
        ChildComments {
          id
        }
        createdAt
        updatedAt
      }
		}
	}
}
`;

export const UPDATE_COMMENT = gql`
  mutation updateComment(
    $updateCommentInput: CommentUpdateInput
    $commentWhere: CommentWhere
  ) {
    updateComments(
      update: $updateCommentInput
      where: $commentWhere
    ) {
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
  }
  `;

export const SOFT_DELETE_COMMENT = gql`
  mutation updateDiscussion(
    $commentId: string
  ) {
    updateComments(
      update: {
        text: "[Deleted]",
      },
      disconnect: {
        CommentAuthor: {
          User: {
            where: {
              node_NOT: {
                username: "[Deleted]"
              }
            }
          }
        }
      }, 
      where: {
        id: $commentId
      }
    ) {
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
  }
  `;

export const DELETE_COMMENT = gql`
  mutation deleteComment($id: ID!) {
      deleteComments(
        where: {
          id: $id
        }
    ) {
      nodesDeleted
      relationshipsDeleted    
    }
  }
`;

