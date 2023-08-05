import { SearchDiscussionValues } from "@/types/discussionTypes";

// The purpose of this function is to convert discussion filter variables
// into the DiscussionWhere input object as it is defined in the auto-generated GraphQL
// documentation for querying discussions.
const getDiscussionWhere = (
  filterValues: SearchDiscussionValues,
) => {
  const { tags, searchInput } = filterValues;

  // These conditions will be added to the filter
  // object under an AND operator.
  const conditions = [];

  // Text search filter
  if (searchInput) {
    conditions.push({
      OR: [
        {
          title_CONTAINS: searchInput,
        },
        {
          body_CONTAINS: searchInput,
        },
      ],
    });
  }

  // Tag filter
  if (tags.length > 0) {
    const matchTags = tags.reduce((prev: any, curr: any) => {
      return prev.concat({ text_CONTAINS: curr });
    }, []);
    conditions.push({
      Tags: {
        OR: matchTags,
      },
    });
  }

  return {
    AND: conditions,
  };
};
export default getDiscussionWhere;
