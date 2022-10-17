<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useMutation, provideApolloClient } from "@vue/apollo-composable";
import { gql } from "@apollo/client/core";
import { apolloClient } from "@/main";
import { CREATE_COMMENT } from "@/graphQLData/comment/mutations";
import { CommentData, CommentSectionData, CreateEditCommentFormValues } from "@/types/commentTypes";
import CreateEditCommentFields from "./CreateEditCommentFields.vue";
import "md-editor-v3/lib/style.css";

export default defineComponent({
    name: "CreateComment",
    components: {
        CreateEditCommentFields,
    },
    props: {
        commentSectionId: {
            type: String,
            required: true,
        },
        isRootComment: {
            type: Boolean,
            default: false,
        }
    },
    apollo: {},
    setup(props) {
        provideApolloClient(apolloClient);

        const route = useRoute();
        const router = useRouter();

        const channelId: string = `${route.params.channelId ? route.params.channelId : ''}`;

        const createCommentDefaultValues: CreateEditCommentFormValues = {
            text: "",
        };

        const formValues = ref(createCommentDefaultValues);

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

            const input = {
                isRootComment: props.isRootComment,
                CommentSection: {
                    connect: {
                        where: {
                            node: {
                                id: props.commentSectionId
                            }
                        }
                    }
                },
                text: formValues.value.text || "",
                // Tags: {
                //   connectOrCreate: tagConnections,
                // },
                CommentAuthor: {
                    User: {
                        connect: {
                            where: {
                                node: {
                                    username: "Alice"
                                }
                            }
                        }
                    }
                }
            };
            return [input];
        });

        const {
            mutate: createComment,
            error: createCommentError,
        } = useMutation(CREATE_COMMENT, () => ({
            errorPolicy: "all",
            variables: {
                createCommentInput: createCommentInput.value,
            },
            update: (cache: any, result: any) => {
                const newComment: CommentData =
                    result.data?.createComments?.comments[0];
                console.log('create comment ', newComment)

                // Will use readQuery and writeQuery to update the cache 
                // https://www.apollographql.com/docs/react/caching/cache-interaction/#using-graphql-queries
            },
        }));

        return {
            channelId,
            createComment,
            createCommentError,
            createCommentInput,
            formValues,
            router,
        };
    },

    methods: {
        async submit() {
            this.createComment();
        },
        updateFormValues(data: CreateEditCommentFormValues) {
            const existingValues = this.formValues;

            this.formValues = {
                ...existingValues,
                ...data,
            };
        },
    },
});
</script>
<template>
    <CreateEditCommentFields :create-comment-error="createCommentError" :edit-mode="false" :form-values="formValues"
        @submit="submit" @updateFormValues="updateFormValues" />
</template>

<style>

</style>