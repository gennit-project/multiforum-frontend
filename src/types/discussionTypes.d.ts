import UserData from './userTypes';
import TagData from './tagTypes';
import DiscussionChannelData from './commentTypes';
import { ChannelData } from './channelTypes';
import { ModProfile } from '@/components/mod/ModProfile.vue';

export interface DiscussionData {
    id: string;
    title: string;
    body: string;
    Channels: [ChannelData];
    Author: UserData;
    Tags: [TagData];
    DiscussionChannels: [DiscussionChannelData];
    createdAt: string;
    updatedAt?: string;
    UpvotedByUsers: [UserData];
    UpvotedByUsersAggregate: {
        count
    };
    DownvotedByModerators: [ModProfile];
    DownvotedByModeratorsAggregate: {
        count
    };
    __typename?: string;
}

export interface CreateEditDiscussionFormValues {
    title: string;
    body: string;
    selectedTags: Array[string];
    selectedChannels: Array[string];
    author: string;
}

export type SearchDiscussionValues = {
    // These values are used to build the
    // EventWhere and ResultsOrder input parameters for the
    // GET_DISCUSSIONS GraphQL query.
    // They are also used in the URL query
    // parameters on the discussion search pages.
    // These must match because the URL query
    // parameters are used to build the EventWhere.
    tags?: Array[string];
    channels?: Array[string];
    searchInput?: string;
    resultsOrder?: string;
  };
  