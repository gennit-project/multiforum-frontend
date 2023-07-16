import ChannelData from '../channel/channelTypes'
import { TagData } from './tagTypes'
import UserData from './userTypes'
import ModeratorData from './userTypes';
import { DiscussionData } from './discussionTypes'

export type DiscussionChannelData = {
  id: string
  CommentsAggregate: {
    count: number
  }
  Discussion: DiscussionData;
  Channel: ChannelData;
  UpvotedByUsers: [UserData];
  UpvotedByUsersAggregate: {count};
  DownvotedByModerators: [ModProfile];
  DownvotedByModeratorsAggregate: {count};
}

export type CreateEditCommentFormValues = {
  depth: number
  parentCommentId?: string
  text: string
  tags?: [TagData]
  isRootComment?: boolean
}

export type CreateReplyInputData = {
  parentCommentId: string
  text: string
  depth: number
}

export type DeleteCommentInputData = {
  parentCommentId: string
  commentId: string
  replyCount: number
}

export type CommentData = {
  id: string
  CommentAuthor: UserData
  text: string
  isRootComment: Boolean
  DiscussionChannel?: DiscussionChannelData
  ParentComment?: CommentData
  ChildCommentsAggregate?: { 
    count: number
  }
  ChildComments?: [Comment]
  deleted?: boolean
  updatedAt?: string
  createdAt: string
  Tags?: [TagData]
  UpvotedByUsers: [UserData]
  DownvotedByModerators: [ModeratorData]
  UpvotedByUsersAggregate?: {
    count: number
  }
  DownvotedByModeratorsAggregate?: {
    count: number
  }
}
