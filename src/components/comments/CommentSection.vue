<script lang="ts">
import { defineComponent } from "vue";
import Comment from "./Comment.vue";
// import LoadMore from "../LoadMore.vue";
import { GET_COMMENT_SECTION } from "@/graphQLData/comment/queries"
// import { CommentData } from "../../types/commentTypes";
import { useQuery } from "@vue/apollo-composable";
import ErrorBanner from "../ErrorBanner.vue";

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
    },
    setup(props) {

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

        // const { smAndDown } = useDisplay();

        return {
            commentError,
            commentLoading,
            commentResult,
            //   loadMore,
            //   reachedEndOfResults,
            //   searchInput,
            //   setSearchInput,
        };
    },

    //   methods: {
    // updateSearchResult(input: string) {
    //   this.setSearchInput(input);
    // },
    //   },
    inheritAttrs: false,
});
</script>
<template>
    <div class="sm:rounded-md pt-4">
    <!-- <p v-if="comments.length === 0" class="px-4 lg:px-12">There are no results.</p>
    <p v-else class="px-4 lg:px-12">
      Showing {{ comments.length }} of {{ resultCount }} results
    </p> -->
    <p v-if="commentLoading">Loading comments...</p>
    <ErrorBanner
      class="mt-2"
      v-else-if="commentError"
      :text="commentError.message"
    />
    <div v-else-if="commentResult.commentSections.length > 0">
        <Comment 
            v-for="comment in commentResult.commentSections[0].Comments" :key="comment.id"
            :author-username="comment.CommentAuthor ? comment.CommentAuthor.username : ''" 
            :compact="true"
            :created-at="comment.createdAt"
            :edited-at="comment.updatedAt"
            :content="comment.text"
            :readonly="true"
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
    </div>
</template>
