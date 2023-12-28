<script lang="ts">
// The CommentSection component has all the comment related
// logic that can be reused for both discussion comments and
// event comments.

// The purpose of this component is to separate out the discussion
// specific logic from the logic that can be reused in the
// context of an event's comments.
import { defineComponent, computed, PropType, ref } from "vue";
import {
  DiscussionChannel,
  CommentCreateInput,
  Comment as CommentType,
} from "@/__generated__/graphql";
import { GET_COMMENT_SECTION } from "@/graphQLData/comment/queries";
import { COMMENT_LIMIT } from "../discussion/detail/DiscussionDetailContent.vue";
import { useRoute } from "vue-router";
import { getSortFromQuery } from "@/components/comments/getSortFromQuery";
import {
  GET_LOCAL_USERNAME,
} from "@/graphQLData/user/queries";
import { useQuery } from "@vue/apollo-composable";
import { CreateEditCommentFormValues } from "@/types/commentTypes";
import CommentSection from "@/components/comments/CommentSection.vue";

type CommentSectionQueryUpdateInput = {
  cache: any;
  commentToDeleteId: string;
}

type UpdateTotalCommentCountInput = {
  cache: any;
  parentOfCommentToDelete: any
}

export default defineComponent({
  name: "DiscussionCommentsWrapper",
  components: {
    CommentSection,
  },
  props: {
    discussionChannel: {
      // This prop is required to create a comment.
      // But I have made it optional so that content does not move around
      // on the screen while the discussionChannel is loading.
      type: Object as PropType<DiscussionChannel>,
      required: false,
      default: () => {
        return null;
      },
    },
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    reachedEndOfResults: {
      type: Boolean,
      required: true,
    },
    previousOffset: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const { result: localUsernameResult } = useQuery(GET_LOCAL_USERNAME);

    const username = computed(() => {
      let username = localUsernameResult.value?.username;
      if (username) {
        return username;
      }
      return "";
    });
    const aggregateCommentCount = computed(() => {
      return props.discussionChannel?.CommentsAggregate?.count || 0
    })

    const commentSectionQueryVariables = {
      discussionId: props.discussionChannel?.discussionId,
      channelUniqueName: props.discussionChannel?.channelUniqueName,
      limit: COMMENT_LIMIT,
      offset: props.previousOffset,
      sort: getSortFromQuery(route.query),
    };
    const createCommentDefaultValues: CreateEditCommentFormValues = {
      text: "",
      isRootComment: false,
      depth: 1,
    };

    const createFormValues = ref<CreateEditCommentFormValues>(
      createCommentDefaultValues,
    );

    const createCommentInput = computed(() => {

      const input: CommentCreateInput = {
        isRootComment: false,
        DiscussionChannel: {
          connect: {
            where: {
              node: {
                id: props.discussionChannel?.id,
              },
            },
          },
        },
        ParentComment: {
          connect: {
            where: {
              node: {
                id: createFormValues.value.parentCommentId,
              },
            },
          },
        },
        text: createFormValues.value.text || "",
        CommentAuthor: {
          User: {
            connect: {
              where: {
                node: {
                  username: username.value,
                },
              },
            },
          },
        },
        UpvotedByUsers: {
          connect: [{
            where: {
              node: {
                username: username.value,
              },
            },
          }],
        },
      };
      return input;
    });

    return {
      aggregateCommentCount,
      commentSectionQueryVariables,
      createCommentInput,
      createFormValues
    };
  },
  methods: {
    updateCreateReplyCommentInput(event: CreateEditCommentFormValues) {
      this.createFormValues = event;
    },
    updateCommentSectionQueryResult(input: CommentSectionQueryUpdateInput) {
      const { cache, commentToDeleteId } = input;
      const readQueryResult = cache.readQuery({
        query: GET_COMMENT_SECTION,
        variables: this.commentSectionQueryVariables,
      });

      const filteredRootComments: Comment[] = (
        readQueryResult?.getCommentSection?.Comments || []
      ).filter(
        (comment: CommentType) => comment.id !== commentToDeleteId,
      );

      cache.writeQuery({
        query: GET_COMMENT_SECTION,
        variables: this.commentSectionQueryVariables,
        data: {
          ...readQueryResult,
          getCommentSection: {
            ...readQueryResult?.getCommentSection,
            Comments: filteredRootComments,
          },
        },
      });
    },
    updateAggregateCount(cache: any) {
      cache.modify({
        id: cache.identify({
          __typename: "DiscussionChannel",
          id: this.discussionChannel?.id,
        }),
        fields: {
          CommentsAggregate(existingValue: any) {
            return {
              ...existingValue,
              count: existingValue.count - 1,
            };
          },
        },
      });
    },
    updateTotalCommentCount(input: UpdateTotalCommentCountInput) {
      const {
        cache,
        parentOfCommentToDelete
      } = input;

      const readDiscussionChannelQueryResult = cache.readQuery({
        query: GET_COMMENT_SECTION,
        variables: this.commentSectionQueryVariables,
      });

      const existingDiscussionChannelData =
        readDiscussionChannelQueryResult?.getCommentSection
          ?.DiscussionChannel;

      let existingCommentAggregate =
        existingDiscussionChannelData?.CommentsAggregate?.count || 0;

      cache.writeQuery({
        query: GET_COMMENT_SECTION,
        variables: {
          ...this.commentSectionQueryVariables,
          commentId: parentOfCommentToDelete.value,
        },
        data: {
          ...readDiscussionChannelQueryResult,
          getCommentSection: {
            ...readDiscussionChannelQueryResult.getCommentSection,
            DiscussionChannel: {
              ...existingDiscussionChannelData,
              CommentsAggregate: {
                ...existingDiscussionChannelData.CommentsAggregate,
                count: Math.max(0, existingCommentAggregate - 1),
              },
            },
          },
        },
      });
    }
  },
});
</script>

<template>
  <CommentSection
    :aggregate-comment-count="aggregateCommentCount" 
    :loading="loading"
    :reached-end-of-results="reachedEndOfResults" 
    :comment-section-query-variables="commentSectionQueryVariables"
    :create-form-values="createFormValues" 
    :create-comment-input="createCommentInput"
    :previous-offset="previousOffset"
    @updateTotalCommentCount="updateTotalCommentCount"
    @updateCommentSectionQueryResult="updateCommentSectionQueryResult"
    @updateAggregateCount="updateAggregateCount"
    @updateCreateReplyCommentInput="updateCreateReplyCommentInput" 
  />
</template>
