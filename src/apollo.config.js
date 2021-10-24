module.exports = {
    client: {
      service: {
        name: 'gennit-vue',
        // URL to the GraphQL API
        url: 'https://twilight-moon.us-west-2.aws.cloud.dgraph.io/graphql',
      },
      // Files processed by the extension
      includes: [
        'src/**/*.vue',
        'src/**/*.js',
      ],
    },
  }