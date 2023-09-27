import { LocationQuery } from "vue-router";

export const commentSortTypes = {
  HOT: "HOT",
  NEW: "NEW",
  TOP: "TOP",
};


const getCommentSortFromQuery = function (
  query: LocationQuery,
): string {
  // Need to re-clean data when route values change
  // Take the default filter values from the query
  // in the URL if the values exist.
  let sort = commentSortTypes.HOT;
  if (query) {
    if (typeof query.sort === "string") {
      sort = query.sort
      return sort
    }
  }
  return commentSortTypes.HOT;
};

export { getCommentSortFromQuery };
