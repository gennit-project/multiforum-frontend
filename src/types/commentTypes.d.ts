import { StringValueNode } from 'graphql'
import ChannelData from './channelTypes'
import { TagData } from './tagTypes'
import UserData from './userTypes'
import { EventData } from './eventTypes'
import { DiscussionData } from './discussionTypes'

export type CommentSectionData = {
  id: string
  CommentsAggregate: {
    count: number
  }
  OriginalPost: EventData | DiscussionData
  Channel: ChannelData
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

export type CommentData = {
  id: string
  CommentAuthor: UserData
  text: string
  isRootComment: Boolean
  CommentSection?: CommentSectionData
  ParentComment?: CommentData
  ChildCommentsAggregate?: { 
    count: number
  }
  ChildComments?: [Comment]
  deleted?: boolean
  updatedAt?: string
  createdAt: string
  Tags?: [TagData]
}
