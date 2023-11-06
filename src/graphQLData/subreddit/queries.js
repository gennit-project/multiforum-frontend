import { gql } from "@apollo/client/core";

export const GET_SUBREDDIT_SIDEBAR = gql`
  query getSubredditSidebar($subredditName: String!) {
    getSubredditSidebar(subredditName: $subredditName) {
      title
      shortDescription
      longDescription
      displayName
      allowGalleries
      allowImages
      communityIcon
      showMediaPreview
      bannerImg
      allowImages
    }
  }
`;

export const GET_SUBREDDIT_POSTS = gql`
  query getSubredditPosts($subredditName: String!) {
    getSubreddit(subredditName: $subredditName) {
      subreddit
      title
      createdUTC
      author
      commentCount
      text
      permalink
      thumbnail
      upvoteCount
      mediaMetadata
      url
    }
  }
`;
