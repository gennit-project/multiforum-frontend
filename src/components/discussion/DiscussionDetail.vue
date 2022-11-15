<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import type { Ref } from "vue";
import Tag from "@/components/Tag.vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { DELETE_DISCUSSION } from "@/graphQLData/discussion/mutations";
import { GET_DISCUSSION } from "@/graphQLData/discussion/queries";
import Comment from "../comments/Comment.vue";
import { relativeTime } from "../../dateTimeUtils";
import WarningModal from "../WarningModal.vue";
import { DateTime } from "luxon";
import { DiscussionData } from "@/types/discussionTypes";
import { ChannelData } from "@/types/channelTypes";
import ErrorBanner from "../ErrorBanner.vue";
import CreateButton from "../CreateButton.vue";
import GenericButton from "../GenericButton.vue";
import CommentSection from "../comments/CommentSection.vue";
import LeftArrowIcon from "@/components/icons/LeftArrowIcon.vue";
import { CommentData, CreateEditCommentFormValues } from "@/types/commentTypes";
import {
  CREATE_COMMENT,
  CREATE_COMMENT_SECTION,
} from "@/graphQLData/comment/mutations";
import { GET_COMMENT_SECTION } from "@/graphQLData/comment/queries"
import "md-editor-v3/lib/style.css";

export default defineComponent({
  components: {
    Comment,
    CommentSection,
    CreateButton,
    ErrorBanner,
    GenericButton,
    LeftArrowIcon,
    Tag,
    WarningModal,
  },
  props: {
    compactMode: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const discussionId = computed(() => {
      if (typeof route.params.discussionId === "string") {
        return route.params.discussionId;
      }
      return "";
    });

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    const {
      result: getDiscussionResult,
      error: getDiscussionError,
      loading: getDiscussionLoading,
      onResult: onDoneGettingDiscussion,
    } = useQuery(GET_DISCUSSION, { id: discussionId });

    const discussion = computed<DiscussionData>(() => {
      if (
        getDiscussionLoading.value ||
        getDiscussionError.value ||
        !discussionId.value
      ) {
        return null;
      }
      return getDiscussionResult.value.discussions[0];
    });

    const editedAt = computed(() => {
      if (
        getDiscussionError.value ||
        getDiscussionLoading.value ||
        !discussion.value.updatedAt
      ) {
        return "";
      }
      return `Edited ${relativeTime(discussion.value.updatedAt)}`;
    });

    const createdAt = computed(() => {
      if (getDiscussionLoading.value || getDiscussionError.value) {
        return "";
      }
      return `posted ${relativeTime(discussion.value.createdAt)}`;
    });

    const commentSectionId = ref("");

    onDoneGettingDiscussion(() => {
      if (discussion.value && discussion.value.CommentSections) {
        const commentSection = discussion.value.CommentSections.find(
          (commentSection) => {
            if (commentSection && commentSection.Channel) {
              return commentSection.Channel.uniqueName === channelId.value;
            }
            return false;
          }
        );
        if (commentSection) {
          commentSectionId.value = commentSection.id;
        }
      }
    });

    const channelsExceptCurrent = computed(() => {
      if (getDiscussionLoading.value || getDiscussionError.value) {
        return [];
      }

      return discussion.value.Channels.filter((channel: ChannelData) => {
        return channel.uniqueName !== channelId.value;
      });
    });

    const {
      mutate: deleteDiscussion,
      error: deleteDiscussionError,
      onDone: onDoneDeleting,
    } = useMutation(DELETE_DISCUSSION, {
      variables: {
        id: discussionId.value,
      },
      update: (cache: any) => {
        cache.modify({
          fields: {
            discussions(existingDiscussionRefs = [], fieldInfo: any) {
              const readField = fieldInfo.readField;

              return existingDiscussionRefs.filter((ref) => {
                return readField("id", ref) !== discussionId.value;
              });
            },
          },
        });
      },
    });

    onDoneDeleting(() => {
      if (channelId.value) {
        router.push({
          name: "SearchDiscussionsInChannel",
          params: {
            channelId: channelId.value,
          },
        });
      }
    });

    const deleteModalIsOpen = ref(false);
    // const showScrollToCommentsButton = ref(true)

    const createCommentDefaultValues: CreateEditCommentFormValues = {
      text: "",
      isRootComment: true,
    };

    const createFormValues = ref<CreateEditCommentFormValues>(
      createCommentDefaultValues
    );

    const createCommentInput = computed(() => {
      //   const tagConnections = formValues.value.tags.map(
      //     (tag: string) => {
      //       return {
      //         onCreate: {
      //           node: {
      //             text: tag,
      //           },
      //         },
      //         where: {
      //           node: {
      //             text: tag,
      //           },
      //         },
      //       };
      //     }
      //   );

      let input = {
        isRootComment: createFormValues.value.isRootComment,

        text: createFormValues.value.text || "",
        // Tags: {
        //   connectOrCreate: tagConnections,
        // },
        CommentAuthor: {
          User: {
            connect: {
              where: {
                node: {
                  username: "Alice",
                },
              },
            },
          },
        },
        CommentSection: {
          connect: {
            where: {
              node: {
                id: commentSectionId.value,
              },
            },
          },
        },
      };

      return [input];
    });
    const {
      mutate: createCommentSection,
      onDone: onDoneCreatingCommentSection,
    } = useMutation(CREATE_COMMENT_SECTION, () => ({
      errorPolicy: "all",
      variables: {
        createCommentSectionInput: [
          {
            OriginalPost: {
              Discussion: {
                connect: {
                  where: {
                    node: {
                      id: discussionId.value,
                    },
                  },
                },
              },
            },
            Channel: {
              connect: { where: { node: { uniqueName: channelId.value } } },
            },
          },
        ],
      },

      update: (cache: any, result: any) => {

        cache.modify({
          fields: {
            discussions() {
              const readQueryResult = cache.readQuery({
                query: GET_DISCUSSION,
                // Provide any required variables in this object.
                // Variables of mismatched types will return `null`.
                variables: {
                  id: discussionId.value,
                },
              });
              if (readQueryResult) {
                const existingDiscussion = readQueryResult.discussions[0];
                const newCommentSection =
                  result.data?.createCommentSections?.commentSections[0];
                cache.writeQuery({
                  query: GET_DISCUSSION,
                  data: {
                    discussions: [
                      {
                        ...existingDiscussion,
                        CommentSections: [
                          ...existingDiscussion.CommentSections,
                          newCommentSection,
                        ],
                      },
                    ],
                  },
                  variables: {
                    id: discussionId.value,
                  },
                });
              }
            },
          },
        });
      },
    }));

    const {
      mutate: createComment,
      error: createCommentError,
    } = useMutation(CREATE_COMMENT, () => ({
      errorPolicy: "all",
      variables: {
        createCommentInput: createCommentInput.value,
      },
      update: (cache: any, result: any) => {
          // This is the logic for updating the cache
          // after replying to a comment. For the logic
          // to create a root level comment, see the
          // parent component.
          const newComment: CommentData =
            result.data?.createComments?.comments[0];
          // Will use readQuery and writeQuery to update the cache
          // https://www.apollographql.com/docs/react/caching/cache-interaction/#using-graphql-queries

          const readQueryResult = cache.readQuery({
            query: GET_COMMENT_SECTION,
            variables: {
              id: commentSectionId.value,
            },
          });

          const existingCommentSectionData =
            readQueryResult?.commentSections[0];
          //commentResult.commentSections[0].CommentsConnection.edges"
          //   :key="comment.node.id"
          let rootCommentsCopy = [ newComment,
            ...(existingCommentSectionData.Comments || []),
          ];

          cache.writeQuery({
            query: GET_COMMENT_SECTION,
            data: {
              ...readQueryResult,
              commentSections: [
                {
                  ...existingCommentSectionData,
                  Comments: rootCommentsCopy,
                },
              ],
            },
            variables: {
              id: commentSectionId.value,
            },
          });
        },
    }));

    const commentSectionRef = ref<InstanceType<typeof CommentSection>>();

    onDoneCreatingCommentSection((cs: any) => {
      const data = cs.data.createCommentSections?.commentSections[0];
      commentSectionId.value = data.id;
    });
    return {
      channelId,
      channelsExceptCurrent,
      commentSectionId,
      commentSectionRef,
      createComment,
      createCommentError,
      createCommentSection,
      createFormValues,
      createdAt,
      deleteModalIsOpen,
      getDiscussionResult,
      getDiscussionError,
      getDiscussionLoading,
      discussionId,
      deleteDiscussion,
      deleteDiscussionError,
      editedAt,
      discussion,
      relativeTime,
      route,
      router,
      showCreateCommentModal: ref(false),
      // showScrollToCommentsButton
    };
  },
  methods: {
    filterDiscussionsByTag(tag: string) {
      this.router.push({
        name: "FilterDiscussionsByTag",
        params: {
          tag,
        },
      });
    },
    getFormattedDateString(startTime: string) {
      const startTimeObj = DateTime.fromISO(startTime);

      return startTimeObj.toFormat("cccc LLLL d yyyy");
    },
    // scrollToComments() {
    //   let commentStart = document.getElementById('comments');
    //   if (commentStart) {
    //     commentStart.scrollIntoView(false);
    //   }
    //   this.handleScroll()
    // },
    // handleScroll() {
    //   const commentSectionHeader = this.$refs.commentSectionHeader;
    //   const scrollToCommentsButton = this.$refs.scrollToCommentsButton;

    //   if (commentSectionHeader && scrollToCommentsButton) {
    //     if (commentSectionHeader.offsetTop - scrollToCommentsButton.offsetTop < 500) {
    //       this.showScrollToCommentsButton = false;
    //     } else {
    //       this.showScrollToCommentsButton = true;
    //     }
    //   }
    // },
    async handleCreateComment() {
      // this.createFormValues.isRootComment = parentCommentData === null;
      if (!this.commentSectionId) {
        await this.createCommentSection();
      }
      this.createComment();
    },
    handleUpdateComment(event: any) {
      this.createFormValues.text = event;
    },
  },
  // mounted() {
  // let ticking = false;
  //   window.addEventListener("scroll", () => {

  //     if (!ticking) {
  //       window.requestAnimationFrame(() => {
  //         ticking = false;
  //         this.handleScroll();

  //       });

  //       ticking = true;
  //     }
  // });
  // },
  // beforeUnmount() {
  //   window.removeEventListener("scroll", this.handleScroll);
  // },
});
</script>

<template>
  <div class="top-10 pb-36 px-4 lg:px-10 height-constrained-more">
    <p v-if="getDiscussionLoading">Loading...</p>
    <ErrorBanner
      class="mt-2"
      v-else-if="getDiscussionError"
      :text="getDiscussionError.message"
    />
    <div
      v-else
      ref="discussionDetail"
      :class="route.name === 'DiscussionDetail' ? ' overflow-y-scroll' : ''"
      class="mx-auto max-w-5xl space-y-2 bg-white pb-4 rounded"
    >
      <router-link
        v-if="route.name === 'DiscussionDetail'"
        :to="`/channels/c/${channelId}/discussions`"
        class="underline text-xs text-gray-500 mb-4"
      >
        <LeftArrowIcon class="h-4 w-4 mr-1 pb-1 inline-flex" />
        {{ `Discussion list in c/${channelId}` }}
      </router-link>
      <div class="mt-4 mb-4 md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h1 class="mt-4 font-bold text-lg sm:tracking-tight">
            {{ discussion.title }}
          </h1>
        </div>
        <div
          v-if="!compactMode && channelId"
          class="flex-shrink-0 flex md:mx-4"
        >
          <div class="float-right">
            <span>
              <router-link
                :to="`/channels/c/${channelId}/discussions/d/${discussionId}/edit`"
              >
                <GenericButton :text="'Edit'" />
              </router-link>
              <CreateButton
                v-if="$route.name === 'DiscussionDetail'"
                class="ml-2"
                :to="`/channels/c/${channelId}/discussions/create`"
                :label="'Create Discussion'"
              />
            </span>
          </div>
        </div>
      </div>

      <div>
        <div>
          <div v-if="discussion.body" class="body">
            <Comment
              :comment-data="{
                id: discussion.id,
                CommentAuthor: {
                  username: discussion.Author.username,
                },
                text: discussion.body,
                createdAt: discussion.createdAt,
                updatedAt: discussion.updatedAt,
                isRootComment: false,
              }"
              :readonly="true"
              @createComment="handleCreateComment"
              @updateComment="handleUpdateComment"
            />
            <div class="text-xs text-gray-600 mt-4">
              <div>
                <router-link
                  v-if="discussion.Author"
                  class="text-blue-800 underline"
                  :to="`/u/${discussion.Author.username}`"
                >
                  {{ discussion.Author.username }}
                </router-link>
                {{ createdAt }}
                <span v-if="discussion.updatedAt"> &#8226; </span>
                {{ editedAt }}
                &#8226;
                <span
                  v-if="!compactMode"
                  class="underline font-medium text-gray-900 cursor-pointer"
                  @click="deleteModalIsOpen = true"
                  >Delete</span
                >
              </div>
            </div>
            <!-- <button ref="scrollToCommentsButton"
                    v-show="showScrollToCommentsButton"
                    aria-label="Scroll to comments"
                    type="button"
                    class="sticky bottom-10 float-right inline-flex mt-1 items-center rounded-full border border-transparent bg-blue-600 p-3 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    @click="scrollToComments">
              <ChevronDoubleDownIcon class="h-6 w-6"
                                     aria-hidden="true" />
            </button> -->
            <Tag
              class="mt-2"
              v-for="tag in discussion.Tags"
              :tag="tag.text"
              :key="tag.text"
              :discussionId="discussionId"
            />
            <button @click="printRefs">print refs</button>
            <div class="text-xs text-gray-600 mt-4">
              <div
                v-if="
                  route.name === 'DiscussionDetail' &&
                  channelsExceptCurrent.length > 0
                "
                class="mt-2"
              >
                Crossposted To Channels:
              </div>
              <Tag
                class="mt-2"
                v-for="channel in channelsExceptCurrent"
                :key="channel.uniqueName"
                :tag="channel.uniqueName"
                :channel-mode="true"
                @click="
                  router.push({
                    name: 'DiscussionDetail',
                    params: {
                      discussionId,
                      channelId: channel.uniqueName,
                    },
                  })
                "
              />
            </div>
            <CommentSection
              ref="commentSectionRef"
              v-if="route.name === 'DiscussionDetail'"
              :commentSectionId="commentSectionId"
            />
          </div>
        </div>
        <!-- <Modal title="Comment on Post"
               :show="showCreateCommentModal"
               :primary-button-text="'Save'"
               @primaryButtonClick="() => {
                createComment()
                showCreateCommentModal = false
            }"
               @secondaryButtonClick="showCreateCommentModal = false"
            >
            <template v-slot:icon>
                <PencilIcon class="h-6 w-6 text-green-600"
                            aria-hidden="true" />
            </template>
            <template v-slot:content>
                
             </template>
        </Modal> -->
        <WarningModal
          :title="'Delete Discussion'"
          :body="'Are you sure you want to delete this discussion?'"
          :open="deleteModalIsOpen"
          @close="deleteModalIsOpen = false"
          @primaryButtonClick="deleteDiscussion"
        />
      </div>
    </div>
    <ErrorBanner
      class="mt-2"
      v-if="deleteDiscussionError"
      :text="deleteDiscussionError.message"
    />
  </div>
</template>
<style>
.height-constrained-more {
  max-height: 84vh;
  height: 100% - 100px;
}
</style>


