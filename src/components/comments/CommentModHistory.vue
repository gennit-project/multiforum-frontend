<script lang="ts">
import { defineComponent, PropType } from "vue";
import { CommentData } from "@/types/commentTypes";
import Table from "../generic/Table.vue";
import TableHead from "../generic/TableHead.vue";
import { relativeTime } from "@/utils/dateTimeUtils";

export default defineComponent({
  name: "CommentModHistory",
  components: {
    TableComponent: Table,
    TableHead,
  },
  props: {
    commentData: {
      type: Object as PropType<CommentData>,
      required: true,
    },
  },
  setup(props: any) {
    return {
      mods: props.commentData.DownvotedByModerators,
      headers: ["Moderator", "Mod Age", "Downvote Reason"],
    };
  },
  methods: {
    relativeTime(time: string){
      return relativeTime(time)?.split(" ago").join("")
    }
  }
});
</script>

<template>
  <div>
    <h3 class="mt-2 text-gray-500">
      Downvote Details
    </h3>
    <p
      v-if="mods.length === 0"
      class="mt-4"
    >
      There are no downvotes.
    </p>
    <TableComponent
      v-else
      class="mb-4 mt-2"
    >
      <template #head>
        <tr>
          <TableHead
            v-for="header in headers"
            :key="header"
          >
            <span>{{ header }}</span>
          </TableHead>
        </tr>
      </template>
      <template #body>
        <tr
          v-for="(mod, i) in mods"
          :key="mod.displayName"
          :class="i % 2 === 0 ? 'bg-gray-100' : ''"
        >
          <td
            class="px-2 py-2 text-left whitespace-nowrap text-sm text-gray-500 underline"
          >
            <router-link :to="`/mod/${mod.displayName}`">
              {{ mod.displayName }}
            </router-link>
          </td>
          <td
            class="px-2 py-2 text-left whitespace-nowrap text-sm text-gray-500"
          >
            {{ relativeTime(mod.createdAt) }}
          </td>
          <td
            class="px-2 py-2 text-left whitespace-nowrap text-sm text-gray-500"
          >
            No reason provided
          </td>
        </tr>
      </template>
    </TableComponent>
  </div>
</template>