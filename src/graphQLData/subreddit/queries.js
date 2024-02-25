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
  query getSubredditPosts($subredditName: String!, $options: RedditPostOptions) {
    getSubreddit(subredditName: $subredditName, options: $options) {
      posts {
        id
        title
        createdUTC
        author
        commentCount
        text
        media
        flair
        numCrossposts
        permalink
        thumbnail
        upvoteCount
        url
        preview
        stickied
      }
      after
    }
  }
`;
