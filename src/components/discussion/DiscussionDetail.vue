<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import Tag from "@/components/tag/Tag.vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { DELETE_DISCUSSION } from "@/graphQLData/discussion/mutations";
import { GET_DISCUSSION } from "@/graphQLData/discussion/queries";
import { relativeTime } from "../../dateTimeUtils";
import WarningModal from "../generic/WarningModal.vue";
import { DateTime } from "luxon";
import { DiscussionData } from "@/types/discussionTypes";
import { ChannelData } from "@/types/channelTypes";
import ErrorBanner from "../generic/ErrorBanner.vue";
import CreateButton from "../generic/CreateButton.vue";
import GenericButton from "../generic/GenericButton.vue";
import CommentSection from "../comments/CommentSection.vue";
import LeftArrowIcon from "@/components/icons/LeftArrowIcon.vue";
import ProfileAvatar from "@/components/user/ProfileAvatar.vue";
import TextEditor from "@/components/comments/TextEditor.vue";
import CancelButton from "@/components/generic/CancelButton.vue";
import SaveButton from "@/components/generic/SaveButton.vue";
import { CommentData, CreateEditCommentFormValues } from "@/types/commentTypes";
import {
  CREATE_COMMENT,
  CREATE_COMMENT_SECTION,
} from "@/graphQLData/comment/mutations";
import { GET_COMMENT_SECTION } from "@/graphQLData/comment/queries";
import MdEditor from "md-editor-v3";
import "md-editor-v3/lib/style.css";

export default defineComponent({
  components: {
    ProfileAvatar,
    CancelButton,
    CommentSection,
    CreateButton,
    ErrorBanner,
    GenericButton,
    LeftArrowIcon,
    MdEditor,
    SaveButton,
    Tag,
    TextEditor,
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

    // Update this ID when creating the first comment and comment
    // section to go with it
    const newCommentSectionId = ref("");

    const commentSectionId = computed(() => {
      if (!discussion.value) {
        return "";
      }
      if (discussion.value.CommentSections) {
        const commentSection = discussion.value.CommentSections.find(
          (commentSection) => {
            if (commentSection && commentSection.Channel) {
              return commentSection.Channel.uniqueName === channelId.value;
            }
            return false;
          }
        );
        if (commentSection) {
          return commentSection.id;
        }
      }
      return newCommentSectionId.value;
    });

    const getCommentCount = (channelId: string) => {
      const commentSections = discussion.value.CommentSections;

      const commentSectionForChannel = commentSections.find((cs: any) => {
        return cs.Channel?.uniqueName === channelId;
      });

      if (!commentSectionForChannel) {
        return 0;
      }
      return commentSectionForChannel.CommentsAggregate?.count
        ? commentSectionForChannel.CommentsAggregate.count
        : 0;
    };

    const channelLinks = computed(() => {
      if (getDiscussionLoading.value || getDiscussionError.value) {
        return [];
      }

      // On the discussion detail page, hide the current channel because
      // that would link to the current page.
      if (route.name === "DiscussionDetail") {
        return discussion.value.Channels.filter((channel: ChannelData) => {
          return channel.uniqueName !== channelId.value;
        });
      }

      if (route.name === "SearchDiscussionPreview") {
        return discussion.value.Channels.filter((channel: ChannelData) => {
          return channel.uniqueName === channelId.value;
        });
      }

      // On the preview, show all of the links as options, sorted by
      // comment count.
      return [...discussion.value.Channels].sort(
        (a: ChannelData, b: ChannelData) => {
          const countA = getCommentCount(a.uniqueName);
          const countB = getCommentCount(b.uniqueName);
          return countB - countA;
        }
      );
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
      depth: 1,
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
        isRootComment: true,

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

    const { mutate: createComment, error: createCommentError } = useMutation(
      CREATE_COMMENT,
      () => ({
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
          let rootCommentsCopy = [
            newComment,
            ...(existingCommentSectionData?.Comments || []),
          ];
          let existingCommentAggregate =
            existingCommentSectionData?.CommentsAggregate
              ? existingCommentSectionData.CommentsAggregate
              : null;
          let newCommentAggregate = null;
          if (existingCommentAggregate) {
            newCommentAggregate = {
              ...existingCommentAggregate,
              count: existingCommentAggregate.count + 1,
            };
          }
          cache.writeQuery({
            query: GET_COMMENT_SECTION,
            data: {
              ...readQueryResult,
              commentSections: [
                {
                  ...existingCommentSectionData,
                  Comments: rootCommentsCopy,
                  CommentsAggregate: newCommentAggregate
                    ? newCommentAggregate
                    : existingCommentAggregate,
                },
              ],
            },
            variables: {
              id: commentSectionId.value,
            },
          });
        },
      })
    );

    const commentSectionRef = ref<InstanceType<typeof CommentSection>>();

    onDoneCreatingCommentSection((cs: any) => {
      const data = cs.data.createCommentSections?.commentSections[0];
      newCommentSectionId.value = data.id;
    });

    const commentSectionIsLocked = computed(() => {
      if (!discussion.value) {
        return false;
      }
      return !discussion.value.Channels.find((c) => {
        return c.uniqueName === channelId.value;
      });
    });

    return {
      channelId,
      channelLinks,
      commentSectionId,
      commentSectionIsLocked,
      commentSectionRef,
      createComment,
      createCommentError,
      createCommentSection,
      createFormValues,
      createdAt,
      deleteModalIsOpen,
      getCommentCount,
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
      showEditorInCommentSection: ref(false),
      showRootCommentEditor: ref(false),
    };
  },
  methods: {
    getFormattedDateString(startTime: string) {
      const startTimeObj = DateTime.fromISO(startTime);

      return startTimeObj.toFormat("cccc LLLL d yyyy");
    },
    async handleCreateComment() {
      if (!this.commentSectionId) {
        if (!this.channelId) {
          throw new Error(
            "Cannot create comment section because there is no channel ID."
          );
        }
        if (!this.discussionId) {
          throw new Error(
            "Cannot create comment section because there is no discussion ID."
          );
        }
        await this.createCommentSection();
      }
      this.createComment();
    },
    handleUpdateComment(event: any) {
      this.createFormValues.text = event;
    },
    updateCreateInputValuesForRootComment(text: string) {
      this.createFormValues.text = text;
    },
  },
});
</script>

<template>
  <div
    class="
      top-10
      pb-36
      px-6
      py-2
      my-2
      height-constrained-more
      lg:w-full
      bg-gray-50
      space-y-2
    "
  >
    <h2
      v-if="route.name !== 'DiscussionDetail'"
      class="pl-4 mt-2 text-gray-400 text-sm"
    >
      Preview
    </h2>
    <p v-if="getDiscussionLoading">Loading...</p>
    <ErrorBanner
      class="mt-2"
      v-else-if="getDiscussionError"
      :text="getDiscussionError.message"
    />
    <router-link
      v-if="route.name === 'DiscussionDetail'"
      :to="`/channels/c/${channelId}/discussions`"
      class="underline text-xs text-gray-500 mb-4"
    >
      <LeftArrowIcon class="h-4 w-4 mr-1 pb-1 inline-flex" />
      {{ `Discussion list in c/${channelId}` }}
    </router-link>
    <div
      v-if="discussion"
      ref="discussionDetail"
      :class="route.name === 'DiscussionDetail' ? ' overflow-y-scroll' : ''"
      class="bg-white p-10 rounded shadow-md"
    >
      <div class="mb-4 md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl max-w-2xl">
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
              <span v-if="route.name === 'DiscussionDetail'"> &#8226;</span>
              <span
                v-if="!compactMode && route.name === 'DiscussionDetail'"
                class="ml-1 underline font-medium text-gray-900 cursor-pointer"
                @click="deleteModalIsOpen = true"
                >Delete</span
              >
              <span v-if="route.name !== 'DiscussionDetail'" class="ml-1 mr-1"
                >&#8226;</span
              >

              <router-link
                v-if="route.name !== 'DiscussionDetail'"
                class="underline font-medium text-gray-900 cursor-pointer"
                :to="`/channels/c/${channelLinks[0].uniqueName}/discussions/d/${discussionId}`"
                >Permalink</router-link
              >
            </div>
          </div>
          <div v-if="discussion.body" class="body max-w-2xl">
            <md-editor
              v-if="discussion.body"
              v-model="discussion.body"
              previewTheme="vuepress"
              codeTheme="vuepress"
              language="en-US"
              :noMermaid="true"
              preview-only
            />
            <div
              v-if="
                route.name === 'DiscussionDetail' && !commentSectionIsLocked
              "
              class="mt-1 flex space-x-2 py-2"
            >
              <ProfileAvatar v-if="!showRootCommentEditor" class="h-5 w-5" />
              <textarea
                v-if="!showRootCommentEditor"
                @click="showRootCommentEditor = true"
                name="clickToAddComment"
                rows="1"
                placeholder="Write a reply"
                class="
                  block
                  w-full
                  rounded-full
                  border-gray-300
                  shadow-sm
                  text-sm
                  focus:border-indigo-500 focus:ring-indigo-500
                "
              />
              <div v-if="showRootCommentEditor">
                <TextEditor
                  class="mb-3 h-48"
                  :placeholder="'Please be kind'"
                  @update="updateCreateInputValuesForRootComment"
                />
                <!-- <ErrorBanner v-if="createCommentError"
                             :text="createCommentError.message" /> -->
                <div class="flex justify-start">
                  <CancelButton @click="showRootCommentEditor = false" />
                  <SaveButton
                    @click.prevent="
                      () => {
                        handleCreateComment();
                        showRootCommentEditor = false;
                      }
                    "
                    :disabled="createFormValues.text.length === 0"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-12 gap-x-4">
            <div class="col-span-12 2xl:col-span-8">
              <div
                v-if="!discussion.body && route.name === 'DiscussionDetail'"
                class="mt-1 flex space-x-2 py-4"
              >
                <ProfileAvatar class="h-5 w-5" />
                <textarea
                  v-if="!showEditorInCommentSection"
                  id="addcomment"
                  @click="showEditorInCommentSection = true"
                  name="addcomment"
                  rows="1"
                  placeholder="Write a reply"
                  class="
                    block
                    w-full
                    rounded-full
                    border-gray-300
                    shadow-sm
                    text-sm
                    max-w-2xl
                    focus:border-indigo-500 focus:ring-indigo-500
                  "
                />
                <div v-else>
                  <TextEditor
                    class="mb-3 h-48"
                    :placeholder="'Please be kind'"
                    @update="handleUpdateComment"
                  />
                  <!-- <ErrorBanner v-if="createCommentError"
                             :text="createCommentError.message" /> -->
                  <div class="flex justify-start">
                    <CancelButton @click="showEditorInCommentSection = false" />
                    <SaveButton
                      @click.prevent="
                        () => {
                          handleCreateComment();
                          showEditorInCommentSection = false;
                        }
                      "
                      :disabled="this.createFormValues.text.length === 0"
                    />
                  </div>
                </div>
              </div>
              <CommentSection
                ref="commentSectionRef"
                v-if="route.name === 'DiscussionDetail'"
                :commentSectionId="commentSectionId"
                :locked="commentSectionIsLocked"
              />
            </div>

            <div class="col-span-12 2xl:col-span-4">
              <div
                class="
                  rounded-lg
                  space-y-4
                  shadow-sm
                  bg-gray-100
                  text-gray-900
                  p-4
                  mr-4
                "
              >
                <div v-if="discussion.Tags.length > 0">Tags</div>
                <Tag
                  class="mt-2"
                  v-for="tag in discussion.Tags"
                  :tag="tag.text"
                  :key="tag.text"
                  :discussionId="discussionId"
                />
                <div v-if="channelLinks.length > 0">
                  Crossposted To Channels
                </div>
                <router-link
                  v-for="channel in channelLinks"
                  :key="channel.uniqueName"
                  :to="{
                    name: 'DiscussionDetail',
                    params: {
                      discussionId,
                      channelId: channel.uniqueName,
                    },
                  }"
                >
                  <Tag
                    class="mt-2"
                    :tag="`${channel.uniqueName} (${getCommentCount(
                      channel.uniqueName
                    )})`"
                    :channel-mode="true"
                  />
                </router-link>
              </div>
            </div>
          </div>
        </div>

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

h1 {
  font-size: 2.65em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}
</style>


