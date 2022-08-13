import { DateTime } from "luxon";
const now = DateTime.now();
const defaultStartTimeObj = now.startOf("hour").plus({ hours: 1 });
const defaultStartTimeISO = defaultStartTimeObj.toISO();
const defaultEndTimeISO = now.startOf("hour").plus({ hours: 2 }).toISO();

export default (channelId) => {
  return {
    poster: "cluse",
    title: "",
    description: "",
    selectedTags: [],
    selectedChannels: [channelId],
    address: "",
    latitude: 0,
    longitude: 0,
    placeId: "",
    locationName: "",
    isInPrivateResidence: false,
    virtualEventUrl: "",
    startTime: defaultStartTimeISO,
    startTimeYear: "",
    startTimeMonth: "",
    startTimeDayOfMonth: "",
    startTimeDayOfWeek: "",
    startTimeHourOfDay: 0,
    endTime: defaultEndTimeISO,
    canceled: false,
    deleted: false,
    cost: "0",
  }
}