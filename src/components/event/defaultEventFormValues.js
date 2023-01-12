import { DateTime } from "luxon";
const now = DateTime.now();
const defaultStartTimeObj = now.startOf("hour").plus({ hours: 1 });
const defaultStartTimeISO = defaultStartTimeObj.toISO();

export default (channelId) => {
  return {
    title: "",
    description: "",
    selectedTags: [],
    selectedChannels: channelId ? [channelId] : [],
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
    endTime: DateTime.fromISO(defaultStartTimeISO).plus({ hours: 2 }).toISO(),
    canceled: false,
    deleted: false,
    free: true,
    cost: "",
  }
}