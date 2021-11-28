import config from '@/config'
module.exports = {
    client: {
      service: {
        name: 'gennit-vue',
        // URL to the GraphQL API
        url: config.graphqlUrl,
      },
      // Files processed by the extension
      includes: [
        'src/**/*.vue',
        'src/**/*.js',
      ],
    },
  }