# gennit-vue

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Set up Back End with Test Data

```
docker run -it -p 8080:8080 dgraph/standalone:master

curl -X POST localhost:8080/admin/schema --data-binary '@schema.graphql'

curl --request POST \
  --url http://localhost:8080/graphql \
  --header 'Content-Type: application/json' \
  --data '{"query":"mutation {\n  addEvent (input: [{\n    title: \"Phoenix\"\n    startTime: \"2021-11-27T22:50:46.228Z\"\n    endTime: \"2021-11-27T23:50:46.228Z\"\n    startTimeYear: \"2021\"\n    startTimeMonth: \"November\"\n    startTimeDayOfWeek: \"Saturday\"\n    startTimeHourOfDay: 15\n    startTimeDayOfMonth: \"27\"\n    Organizer: {\n      username: \"cluse\"\n    }\n    canceled: false\n    location: {\n      latitude: 33.4484\n      longitude: -112.0740\n    },\n    Communities: [{ \n      url: \"cats\"\n      name: \"Cats\"\n    }],\n    CommentSections: [{\n      Community:\n      { url: \"cats\"}\n    }]\n  },{\n    title: \"Tempe\"\n    startTime: \"2021-11-27T22:50:46.228Z\"\n    endTime: \"2021-11-27T23:50:46.228Z\"\n    startTimeYear: \"2021\"\n    startTimeMonth: \"November\"\n    startTimeDayOfWeek: \"Saturday\"\n    startTimeHourOfDay: 15\n    startTimeDayOfMonth: \"27\"\n    Organizer: {\n      username: \"cluse\"\n    }\n    canceled: false\n    location: {\n      latitude: 33.427204\n      longitude: -111.939896\n    },\n    Communities: [{ url: \"cats\"}],\n    CommentSections: [{\n      Community:\n      { url: \"cats\"}\n    }]\n  },\n    {\n    title: \"Tucson\"\n    startTime: \"2021-11-27T22:50:46.228Z\"\n    endTime: \"2021-11-27T23:50:46.228Z\"\n    startTimeYear: \"2021\"\n    startTimeMonth: \"November\"\n    startTimeDayOfWeek: \"Saturday\"\n    startTimeHourOfDay: 15\n    startTimeDayOfMonth: \"27\"\n    Organizer: {\n      username: \"cluse\"\n    }\n    canceled: false\n    location: {\n      latitude: 32.253460\n      longitude: -110.911789\n    },\n    Communities: [{ url: \"cats\"}],\n    CommentSections: [{\n      Community:\n      { url: \"cats\"}\n    }]\n  }\n  ]\n  ) {\n    event {\n      id\n      title\n      description\n      startTime\n      location {\n        latitude\n        longitude\n      }\n    }\n  }\n}"}'
```