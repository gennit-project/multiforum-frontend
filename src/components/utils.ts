import { TagData } from "@/types/tagTypes";
import { gql } from "@apollo/client/core";

export function encodeSpacesInURL(url: string) {
  return url.split(' ').join('%20');
}

export const getTagLabel = (selectedTags: Array<string>) => {
  if (selectedTags.length === 0) {
    return "Tags"
  }
  return `Tags (${selectedTags.length})`
};

export const getLinksInText = (text: string) => {
  if (!text) {
    return [];
  }
  const matches = text.match(
    /https?:\/\/(?!(?:.*\.(?:jpe?g|gif|png)))[^\s]+/g
  ) as string[];
  if (matches) {
    return matches;
  }
  return [];
}

export const getChannelLabel = (selectedChannels: Array<string>) => {
    if (selectedChannels.length === 0) {
      return "Channels"
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
