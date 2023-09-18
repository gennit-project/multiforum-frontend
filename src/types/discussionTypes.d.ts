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
    tags?: Array[string];
    channels?: Array[string];
    searchInput?: string;
  };
  