<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";
import Comment from "./Comment.vue";
// import LoadMore from "../LoadMore.vue";
import { GET_COMMENT_SECTION } from "@/graphQLData/comment/queries"
import { DELETE_COMMENT, UPDATE_COMMENT } from "@/graphQLData/comment/mutations";
import { CommentData } from "../../types/commentTypes";
import { useQuery, useMutation } from "@vue/apollo-composable";
import ErrorBanner from "../ErrorBanner.vue";
import WarningModal from "../WarningModal.vue";

export default defineComponent({
    props: {
        commentSectionId: {
            type: String,
            required: true,
        }
    },
    components: {
        Comment,
        ErrorBanner,
        // LoadMore,
        WarningModal,
    },
    setup(props) {
        const route = useRoute();

        // const searchInput: Ref<string> = ref("");

        // const setSearchInput = (input: string) => {
        //   searchInput.value = input;
        // };

        const {
            result: commentResult,
            error: commentError,
            loading: commentLoading,
            //   refetch: refetchComments,
            //   fetchMore,
        } = useQuery(GET_COMMENT_SECTION, {
            id: props.commentSectionId,
            // limit: 25,
            // offset: 0,
        })

        const {
            mutate: editComment,
            // error: editCommentError,
        } = useMutation(UPDATE_COMMENT)


        const commentToDelete =  ref('')

        const {
            mutate: deleteComment,
            // error: deleteCommentError,
        } = useMutation(DELETE_COMMENT, {
            update: (cache: any, ) => {

                cache.modify({
                    id: cache.identify({
                        __typename: 'CommentSection',
                        id: props.commentSectionId,
                    }),
                    fields: {
                        comments(existingComments: any, { readField }: any) {
                            const newComments = existingComments.filter((comment: any) => {
                                return readField("id", comment) !== commentToDelete.value
                           })
                        console.log({newComments, existingComments})
                            return newComments
                        }
                    }
                })
            },
        });

        // const reachedEndOfResults = ref(false);

        // const loadMore = () => {
        //   fetchMore({
        //     variables: {
        //       offset: commentResult.value.comments.length,
        //     },
        //     updateQuery: (previousResult, { fetchMoreResult }) => {
        //       if (!fetchMoreResult) return previousResult;

        //       return {
        //         ...previousResult,
        //         comments: [
        //           ...previousResult.comments,
        //           ...fetchMoreResult.comments,
        //         ],
        //       };
        //     },
        //   });
        // };

        return {
            commentError,
            commentLoading,
            commentToDelete,
            commentResult,
            deleteComment,
            showDeleteCommentModal: ref(false),
            editComment,
            showEditCommentModal: ref(false),

            //   loadMore,
            //   reachedEndOfResults,
            route
            //   searchInput,
            //   setSearchInput,
        };
    },

    methods: {
        handleClickDelete(commentId: string){
            this.showDeleteCommentModal = true;
            this.commentToDelete = commentId;
        },
        handleDeleteComment(commentId: string) {
            console.log("handleDeleteComment", commentId);
            this.deleteComment({
                id: commentId,
            });
        },
        handleEditComment(commentId: string) {
            this.editComment({
                id: commentId,
            });
        },
        // updateSearchResult(input: string) {
        //   this.setSearchInput(input);
        // },
    },
    inheritAttrs: false,
});
</script>
<template>
    <div class="sm:rounded-md pt-4">
        <p v-if="commentLoading">Loading comments...</p>
        <ErrorBanner class="mt-2" v-else-if="commentError" :text="commentError.message" />
        <div v-else-if="commentResult.commentSections.length > 0">
            <h2 
              v-if="route.name === 'DiscussionDetail'"
              id='comments' 
              ref="commentSectionHeader" 
              class="text-xl"
            >{{ `Top Comments (${commentResult.commentSections[0].Comments.length})`}}</h2>
            <Comment 
              v-for="comment in commentResult.commentSections[0].Comments" 
              :key="comment.id"
              :author-username="comment.CommentAuthor ? comment.CommentAuthor.username : ''" 
              :compact="true"
              :comment-id="comment.id"
              :created-at="comment.createdAt"
              :edited-at="comment.updatedAt" 
              :content="comment.text" 
              :readonly="true"
              @edit="this.showEditCommentModal = true" 
              @delete="handleClickDelete($event)" 
            />
        </div>


        <p v-else>Could not find the comment section.</p>
        <!-- <div v-if="comments.length > 0" class="px-4 lg:px-12">
      <LoadMore
        class="justify-self-center"
        :reached-end-of-results="resultCount === comments.length"
        @loadMore="$emit('loadMore')"
      />
    </div> -->
        <WarningModal 
          :title="'Delete Comment'"
          :body="'Are you sure you want to delete this comment?'"
          :open="showDeleteCommentModal" 
          @close="showDeleteCommentModal = false" 
          @delete="handleDeleteComment(commentToDelete)" 
        />
        <!-- <EditModal/> -->
    </div>
</template>
