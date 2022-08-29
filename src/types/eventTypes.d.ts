import ChannelData from "./channelTypes";
import UserData from "./userTypes";
import TagData from "./tagTypes";
import CommentSectionData from "./commentTypes";

enum DateRangeTypes {
  FUTURE = "FUTURE",
  PAST = "PAST",
  BETWEEN_TWO_DATES = "BETWEEN_TWO_DATES",
}

enum DistanceUnits {
  km = "km",
  mi = "mi",
}

enum LocationFilterTypes {
  ONLY_VIRTUAL = "ONLY_VIRTUAL",
  ONLY_WITH_ADDRESS = "ONLY_WITH_ADDRESS",
  WITHIN_RADIUS = "WITHIN_RADIUS",
  NONE = "NONE",
}

export type Point = {
  latitude: number;
  longitude: number;
};
export interface CreateEditEventFormValues {
  title: string;
  description: string;
  selectedTags: Array[string];
  selectedChannels: Array[string];
  poster: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  placeId: string;
  locationName?: string;
  isInPrivateResidence: boolean;
  virtualEventUrl?: string;
  startTime: string;
  startTimeYear: string;
  startTimeMonth: string;
  startTimeDayOfMonth: string;
  startTimeDayOfWeek: string;
  startTimeHourOfDay: number;
  endTime: string;
  canceled: boolean;
  deleted: boolean;
  cost: string;
  free: boolean;
}
export interface EventData {
  id: string?;
  title: string;
  description: string;
  address?: string;
  location?: Point;
  placeId: string;
  locationName?: string;
  isInPrivateResidence: boolean;
  virtualEventUrl?: string;
  startTime: string;
  startTimeYear: string;
  startTimeMonth: string;
  startTimeDayOfMonth: string;
  startTimeDayOfWeek: string;
  startTimeHourOfDay: number;
  endTime: string;
  canceled: boolean;
  deleted: boolean;
  cost: string;
  free: boolean;
  Channels: Array[ChannelData];
  Poster?: UserData;
  Tags: Array[TagData];
  CommentSections: [CommentSectionData];
  updatedAt: string;
  createdAt: string;
}


export type WeekdayData = {
  number: string;
  name: string;
  shortName: string;
};

export type HourRangeData = {
  min: number;
  max: number;
  "12-hour-label": string;
  "24-hour-label": string;
};

export type SelectedWeekdays = {
  [index: string]: boolean;
};

export type SelectedHourRanges = {
  [index: string]: boolean;
};

export type SelectedHourRangeObject = {
  [index: string]: HourRangeData;
};

export type SelectedWeekdayObject = {
  [index: string]: string;
};

export type SelectedWeeklyHourRanges = {
  [index: string]: SelectedHourRanges;
};

export type ReferencePoint = {
  lat: Number;
  lng: Number;
};

export type DistanceUnit = {
  [index: string]: string;
};

export type Distance = any;

export type SearchEventValues = {
  resultsOrder: string;
  showCanceledEvents: boolean;
  startTimeFilter: string;
  freeEventFilter: string;
  textFilter: string;
  weeklyTimeRangeFilter: string;
  locationFilter: string;
  tagFilter: string;
  channelFilter: string;
};
