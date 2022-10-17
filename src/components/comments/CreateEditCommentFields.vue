<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ApolloError } from "@apollo/client/errors";
import TextEditor from "@/components/TextEditor.vue";
// import PencilIcon from "@/components/icons/PencilIcon.vue";
import ErrorBanner from "@/components/ErrorBanner.vue";
import { CreateEditCommentFormValues } from "@/types/commentTypes";

export default defineComponent({
    name: "CreateEditCommentFields",

    props: {
        editMode: {
            type: Boolean,
            required: true,
        },
        createCommentError: {
            type: Object as PropType<ApolloError | null>,
            default: () => {
                return null;
            },
        },
        formValues: {
            type: Object as PropType<CreateEditCommentFormValues>,
            required: false,
        },
        getCommentError: {
            type: Object as PropType<ApolloError | null>,
            default: () => {
                return null;
            },
        },
        updateCommentError: {
            type: Object as PropType<ApolloError | null>,
            default: () => {
                return null;
            },
        },
        commentLoading: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        return {
            touched: false,
        };
    },
    computed: {
        needsChanges() {
            const needsChanges = !(
                this.formValues.text.length > 0
            );
            return needsChanges;
        },
        changesRequiredMessage() {
            if (this.formValues.text.length === 0) {
                return "Comment cannot be empty.";
            }
            return "";
        },
    },
    components: {
        TextEditor,
        // PencilIcon,
        ErrorBanner,
    },
});
</script>
<template>
    <div>
        <div v-if="commentLoading">Loading...</div>
        <div v-else-if="getCommentError">
            <div v-for="(error, i) of getCommentError?.graphQLErrors" :key="i">
                {{ error.message }}
            </div>
        </div>
        <TextEditor class="mb-3 h-36" :initial-value="formValues?.text ? formValues.text : ''" :placeholder="'Comment'"
            @update="($event) => {
              $emit('updateFormValues', { text: $event });
              this.touched = true;
            }" />
        <button @click="$emit('submit')">Submit</button>
        <ErrorBanner v-if="touched && needsChanges" :text="changesRequiredMessage" />
        <ErrorBanner v-if="createCommentError" :text="createCommentError.message" />
        <ErrorBanner v-if="updateCommentError" :text="updateCommentError.message" />
    </div>
</template>