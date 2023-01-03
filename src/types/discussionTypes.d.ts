import UserData from './userTypes';
import TagData from './tagTypes';
import CommentSectionData from './commentTypes';
import { ChannelData } from './channelTypes';

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
    __typename?: string;
}

export interface CreateEditDiscussionFormValues {
    title: string;
    body: string;
    selectedTags: Array[string];
    selectedChannels: Array[string];
}