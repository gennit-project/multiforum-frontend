import { CommentSort, SortDirection } from "@/__generated__/graphql";
import { LocationQuery } from "vue-router";

const commentSortTypes = {
  HOT: "HOT",
  NEW: "NEW",
  TOP: "TOP",
};

const sortObjects: Record<string, CommentSort> = {
  HOT: {
    weightedVotesCount: SortDirection.Desc,
  },
  NEW: {
    createdAt: SortDirection.Desc,
  },
  TOP: {
    weightedVotesCount: SortDirection.Desc,
  },
};

const getCommentSortFromQuery = function (
  query: LocationQuery,
): CommentSort {
  // Need to re-clean data when route values change
  // Take the default filter values from the query
  // in the URL if the values exist.
  let sort = commentSortTypes.HOT;
  if (query) {
    if (typeof query.sort === "string") {
      sort = query.sort
    }
  }
  let sortObject = sortObjects.HOT;

  switch (sort) {
    case commentSortTypes.HOT:
      sortObject = sortObjects.HOT;
      break;
    case commentSortTypes.NEW:
      sortObject = sortObjects.NEW;
      break;
    case commentSortTypes.TOP:
      sortObject = sortObjects.TOP;
      break;
  }

  return sortObject;
};

export { getCommentSortFromQuery };
