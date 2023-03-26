import UserData from './userTypes';
import TagData from './tagTypes';
import CommentSectionData from './commentTypes';
import { ChannelData } from './channelTypes';
import { ModProfile } from '@/components/mod/ModProfile.vue';

export interface DiscussionData {
    id: string;
    title: string;
    body: string;
    Channels: [ChannelData];
    Author: UserData;
    Tags: [TagData];
    CommentSections: [CommentSectionData];
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
}