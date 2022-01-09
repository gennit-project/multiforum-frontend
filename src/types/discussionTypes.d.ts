import UserData from './userTypes';
import TagData from './tagTypes';
import CommentSectionData from './commentTypes';

export type DiscussionData = {
    id: number;
    title: string;
    body: string;
    Channels: [];
    Author: UserData;
    Tags: [TagData];
    CommentSections: [CommentSectionData];
    createdDate: string;
}