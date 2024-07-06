const config = {
    "domain": import.meta.env.VITE_DOMAIN,
    "clientId": import.meta.env.VITE_AUTH0_CLIENT_ID,
    "graphqlUrlDev": import.meta.env.VITE_GRAPHQL_URL_DEV,
    "graphqlUrlProd": import.meta.env.VITE_GRAPHQL_URL_PROD,
    "googleMapsApiKey": import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    "environment": import.meta.env.VITE_ENVIRONMENT,
    "openGraphApiKey": import.meta.env.VITE_OPEN_GRAPH_API_KEY,
    "baseUrl": import.meta.env.VITE_BASE_URL,
    "sentryDsn": import.meta.env.VITE_SENTRY_DSN,
    "sentryAuthToken": import.meta.env.VITE_SENTRY_AUTH_TOKEN,
    "googleCloudStorageBucket": import.meta.env.VITE_GOOGLE_CLOUD_STORAGE_BUCKET,
 }

 export default config;