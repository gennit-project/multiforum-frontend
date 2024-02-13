<script lang="ts">
import { computed, defineComponent } from "vue";
import CheckIcon from "@/components/icons/CheckIcon.vue";
import { DateTime } from "luxon";
import { GET_ISSUES_BY_CHANNEL } from "@/graphQLData/issue/queries";
import { useQuery } from "@vue/apollo-composable";
import { useRoute } from "vue-router";
import { Issue } from "@/__generated__/graphql";
// type Issue {
//     id: ID! @id
//     Author: IssueAuthor @relationship(type: "AUTHORED_ISSUE", direction: IN)
//     title: String
//     body: String
//     isOpen: Boolean!
//     createdAt: DateTime! @timestamp(operations: [CREATE])
//     updatedAt: DateTime! @timestamp(operations: [UPDATE])
//     Comments: [Comment!]!
//       @relationship(type: "CITED_ISSUE", direction: IN)
//   }

export default defineComponent({
  name: "BackLink",
  components: {
    CheckIcon,
  },
  props: {
    link: {
      type: String,
      default: "",
    },
    dataTestid: {
      type: String,
      default: "",
    },
  },
  setup() {
    const route = useRoute();

    const channelId = computed(() => {
      if (typeof route.params.channelId !== "string") {
        return "";
      }
      return route.params.channelId;
    });

    const {
      result: getIssuesByChannelResult,
      error: getIssuesByChannelError,
      loading: getIssuesByChannelLoading,
    } = useQuery(GET_ISSUES_BY_CHANNEL, {
      channelUniqueName: channelId.value
    });

    const issues = computed<Issue[]>(() => {
      if (getIssuesByChannelLoading.value || getIssuesByChannelError.value) {
        return [];
      }
      const channelData = getIssuesByChannelResult.value.channels[0];

      if (!channelData || !channelData.Issues) {
        return [];
      }
      return channelData.Issues;
    });

    const openCount = computed(() => {
      return issues.value.filter((issue) => issue.isOpen).length;
    });

    const closedCount = computed(() => {
      return issues.value.filter((issue) => !issue.isOpen).length;
    });
    const showClosed = false;
    return {
        channelId,
      issues,
      openCount,
      closedCount,
        showClosed,
    };
  },
  methods: {
    formatDate(date: string) {
      return DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL);
    },
  },
});
</script>

<template>
  <div class="bg-white dark:bg-black">
    <div class="flex items-center gap-4 p-3 pl-8">
      <span class="flex items-center gap-2"><i class="far fa-dot-circle" />{{ openCount }} Open</span>
      <span
        class="flex items-center gap-1"
        :class="{'text-gray-500 dark:text-gray-400': !showClosed}"
      ><CheckIcon />{{ closedCount }} Closed</span>
    </div>
    <ul
      class="border-t border-gray-200 dark:border-gray-800 divide-y"
      data-testid="issue-list"
    >
      <li
        v-for="(issue, index) in issues"
        :key="index"
        class="border-bottom flex flex-col  border-gray-200 p-3 pl-8 dark:border-gray-800"
      >
        <div class="text-md">
          <i class="far fa-dot-circle list-item-icon" />
    
          <router-link
            :to="{
              name: 'IssueDetail',
              params: { 
                issueId: issue.id,
                channelId: channelId,
              },
          
            }"
          >
            {{ issue.title }}
          </router-link>
        </div>
        <div class="ml-6 text-xs text-gray-500 dark:text-gray-400">
          {{
            `Opened on ${formatDate(issue.createdAt)} by ${
              issue.Author?.displayName || "[Deleted]"
            }`
          }}
        </div>
      </li>
    </ul>
  </div>
</template>

<style>
/* Add your table styling here */
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f4f4f4;
}
.list-item-icon {
  /* Style for the dot circle icon */
  margin-right: 8px;
  color: green; /* or any color you prefer */
}
</style>
