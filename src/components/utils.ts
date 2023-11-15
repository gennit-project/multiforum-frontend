import { TagData } from "@/types/tagTypes";
import { gql } from "@apollo/client/core";
import { DateTime, Interval } from "luxon";

export function encodeSpacesInURL(url: string) {
  return url.split(" ").join("%20");
}
export function getDuration(startTime: string, endTime: string) {
  if (DateTime.fromISO(startTime) >= DateTime.fromISO(endTime)) {
    return "";
  }
  // Format time as "1h 30m"
  const obj = Interval.fromDateTimes(
    DateTime.fromISO(startTime),
    DateTime.fromISO(endTime),
  )
    .toDuration()
    .shiftTo("days", "hours", "minutes")
    .toObject();

  let timeString = "";
  if (obj.days) {
    timeString += `${obj.days}d `;
  }
  if (obj.hours) {
    timeString += `${obj.hours}h `;
  }
  if (obj.minutes) {
    // convert decimal to int
    timeString += `${Math.floor(obj.minutes)}m`;
  }
  return timeString;
}
export const getTagLabel = (selectedTags: Array<string>) => {
  if (selectedTags.length === 0) {
    return "Tags";
  }
  return `Tags (${selectedTags.length})`;
};

export const getLinksInText = (text: string) => {
  if (!text) {
    return [];
  }
  const matches = text.match(
    /https?:\/\/(?!(?:.*\.(?:jpe?g|gif|png)))[^\s]+/g,
  ) as string[];
  if (matches) {
    return matches;
  }
  return [];
};

export const getChannelLabel = (selectedChannels: Array<string>) => {
  if (selectedChannels.length === 0) {
    return "Channels";
  }
  return `Channels (${selectedChannels.length})`;
};

export const updateTagsInCache = (cache: any, updatedTags: Array<TagData>) => {
  cache.modify({
    fields: {
      tags(existingTagRefs = [], fieldInfo: any) {
        const readField = fieldInfo.readField;

        const tagRefsOnDiscussion = updatedTags.map((tagData: TagData) => {
          return cache.writeFragment({
            data: tagData,
            fragment: gql`
              fragment NewTag on Tags {
                text
              }
            `,
          });
        });

        const newTagRefs = [];

        for (let i = 0; i < tagRefsOnDiscussion.length; i++) {
          const newTagRef = tagRefsOnDiscussion[i];
          const alreadyExists = existingTagRefs.some(
            (ref: any) =>
              readField("text", ref) === readField("text", newTagRef),
          );
          if (!alreadyExists) {
            newTagRefs.push(newTagRef);
          }
        }

        return [...newTagRefs, ...existingTagRefs];
      },
    },
  });
};
