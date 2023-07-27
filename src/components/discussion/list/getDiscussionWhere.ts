import { SearchDiscussionValues } from "@/types/discussionTypes";

// The purpose of this function is to convert discussion filter variables
// into the DiscussionWhere input object as it is defined in the auto-generated GraphQL
// documentation for querying discussions.
const getDiscussionWhere = (filterValues: SearchDiscussionValues, channelId: string) => {
  const { tags, channels, searchInput } = filterValues;

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
  const truthyChannels = channels.filter((channel: string) => {
    // Don't filter for a channel if a channel is an empty string.
    // This could happen if the query params are `?channels=`.
    return !!channel;
  });

  // Channel filter
  if (channelId) {
    // If we are in the channel view, only show discussions from
    // that channel, even if a channel filter has accidentally
    // gotten into the query params.
    conditions.push({
      DiscussionChannels: { 
        channelUniqueName: channelId
      },
    });
  } else if (truthyChannels.length > 0) {
    // If we are in the sitewide discussion search page,
    // show discussions from any channel in the query params.

    const matchChannels = truthyChannels.reduce(
      // Technically a selected channel could be an array
      // of strings, but we expect it to always be a string.
      (prev: any, curr: any) => {
        return prev.concat({ 
          channelUniqueName: curr 
        });
      },
      []
    );
    conditions.push({
      DiscussionChannels: {
        OR: matchChannels,
      },
    });
  }

  return {
    AND: conditions,
  };
};
export default getDiscussionWhere;
