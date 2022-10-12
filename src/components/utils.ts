import { TagData } from "@/types/tagTypes";
import { gql } from "@apollo/client/core";

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
              readField("text", ref) === readField("text", newTagRef)
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
