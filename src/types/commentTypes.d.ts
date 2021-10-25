import { StringValueNode } from 'graphql';
import CommunityData from './communityTypes';

export type CommentSectionData = {
    id: string;
    CommentsAggregate: {
        count: number;
    },
    Community: CommunityData;
}