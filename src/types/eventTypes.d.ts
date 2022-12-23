import ChannelData from "./channelTypes";
import UserData from "./userTypes";
import TagData from "./tagTypes";
import CommentSectionData from "./commentTypes";

export type SetEventTimeRangeOptions = {
  beginningOfDateRangeISO: string;
  endOfDateRangeISO: string;
  value: string;
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
  id: string;
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

export type DistanceUnit = {
  label: string,
  value: string | number
};

export type Distance = any;

export type SearchEventValues = {
  // These values are used to build the
  // EventWhere and ResultsOrder input parameters for the
  // GET_EVENTS GraphQL query.
  // They are also used in the URL query
  // parameters on the event search pages.
  // These must match because the URL query
  // parameters are used to build the EventWhere.
  beginningOfDateRangeISO?: string;
  endOfDateRangeISO?: string;
  radius?: number;
  latitude?: number;
  longitude?: number;
  tags?: Array[string];
  channels?: Array[string];
  weeklyHourRanges?: Array[SelectedWeeklyHourRanges]
  locationFilter?: string;
  searchInput?: string;
  showCanceledEvents?: boolean;
  free?: boolean;
  resultsOrder?: any;
};
