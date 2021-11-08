import ChannelData from "./channelTypes";
import UserData from "./userTypes";
import TagData from "./tagTypes";
import CommentSectionData from './commentTypes';

export type Point = {
  latitude: number;
  longitude: number;
};

export type EventData = {
  id: string;
  title: string;
  address?: string;
  location?: Point;
  locationName?: string;
  virtualEventUrl?: string;
  startTime: string;
  endTime: string;
  Communities: Array[ChannelData];
  Organizer?: UserData;
  Tags: Array[TagData];
  CommentSections: [CommentSectionData];
};
