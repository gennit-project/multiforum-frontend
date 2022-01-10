// import { TagData } from "@/types/tagTypes";

export const getTagLabel = (selectedTags: Array<String>) => {
  if (selectedTags.length > 0) {
    const tagString = selectedTags.join(", ");
    return `Tags: ${tagString}`;
  }
  return "Tags";
};

export const getChannelLabel = (selectedChannels: Array<string>) => {
  if (selectedChannels.length > 0) {
    const channelString = selectedChannels.join(", ");
    return `Channels: ${channelString}`;
  }
  return "Channels";
};
