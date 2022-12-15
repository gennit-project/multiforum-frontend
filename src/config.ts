const config = {
    "domain": import.meta.env.VITE_DOMAIN,
    "clientId": import.meta.env.VITE_CLIENT_ID,
    "graphqlUrlDev": import.meta.env.VITE_GRAPHQL_URL_DEV,
    "graphqlUrlProd": import.meta.env.VITE_GRAPHQL_URL_PROD,
    "googleMapsApiKey": import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    "environment": import.meta.env.VITE_ENVIRONMENT
 }

 export default config;