import UserData from './userTypes';
import TagData from './tagTypes';
import CommentSectionData from './commentTypes';
import { ChannelData } from './channelTypes';

export type DiscussionData = {
    id: number;
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