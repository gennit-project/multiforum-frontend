import { StringValueNode } from 'graphql';
import ChannelData from './channelTypes';

export type CommentSectionData = {
    id: string;
    CommentsAggregate: {
        count: number;
    },
    Channel: ChannelData;
}