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
  description: string;
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

export type WeekdayData = {
  number: string;
  name: string;
  shortName: string;
}

export type HourRangeData = {
  min: number;
  max: number;
  "12-hour-label": string;
  "24-hour-label": string;
}

export type WeeklyHourRangeData = {
  [index: string]: Array[HourRangeData];
}

export type SelectedWeekdays = {
  [index: string]: boolean;
}

export type SelectedHourRanges = {
  [index: string]: boolean;
}