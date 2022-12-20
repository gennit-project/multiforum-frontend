
```sh

# Create channels
curl --request POST \
  --url http://localhost:4000/graphql \
  --header 'Content-Type: application/json' \
  --data '{"query":"mutation {\n\tcreateChannels (input: [\n\t\t{ {\n\t\t\tuniqueName: \"music\",\n\t\t\tname: \"Music\"\n\t\t},{\n\t\t\tuniqueName: \"phx_concerts\",\n\t\t\tname: \"Phoenix Concerts\"\n\t\t}\n\t]\n\t\t\n\t){\n\t\tchannels {\n\t\t\tuniqueName,\n\t\t\tname\n\t\t}\n\t}\n}"}'

# Create events
curl --request POST \
    --header 'content-type: application/json' \
    --url http://localhost:4000/graphql \
    --data '{"query":"mutation createThirteenEvents {\n  createEvents(input: [\n    {\n      title: \"GATHERING OF BONES\",\n      description: \"with Arsenic Kitchen, Commiserate, Killing Sunday\",\n      startTime: \"2022-01-20T05:21:37.146Z\",\n      endTime: \"2022-01-20T05:21:37.146Z\",\n      Channels: {\n\t\t\t\tconnect: {\n\t\t\t\t\t\twhere: {\n\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\tuniqueName: \"phx_music\"\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t}\n\t\t\tCommentSections: {\n\t\t\t\tcreate: [{\n\t\t\t\t\tnode: {\n\t\t\t\t\t\tChannel: { \n\t\t\t\t\t\t  connectOrCreate: { \n\t\t\t\t\t\t\t\tonCreate: {\n\t\t\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\t\t\tname: \"Phoenix Music\"\n\t\t\t\t\t\t\t\t\t\tuniqueName: \"phx_music\"\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\twhere: {\n\t\t\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\t\t\tuniqueName: \"phx_music\"\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t},\n\t\t\t\t\t  Comments: {\n\t\t\t\t\t\t  create: [{\n                node: {\n                  text: \"Comment1\"\n                  isRootComment: true\n                  CommentAuthor: {\n                    User: {\n                      connectOrCreate: {\n                        where: {\n                          node: {\n                            username: \"cluse\"\n                          }\n                        },\n                        onCreate: {\n                          node: {\n                            username: \"cluse\"\n                          }\n                        }\n                      }\n\t\t\t\t\t\t\t\t\t  }\n\t\t\t\t\t\t\t  \t}\n\t\t\t\t\t\t    },\n\t\t\t\t\t\t},{\n\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\ttext: \"Comment2\"\n\t\t\t\t\t\t\t  isRootComment: true\n\t\t\t\t\t\t\t\tCommentAuthor: {\n\t\t\t\t\t\t\t\t\tUser: {\n\t\t\t\t\t\t\t\t\t\tconnectOrCreate: {\n\t\t\t\t\t\t\t\t\t\t\twhere: {\n\t\t\t\t\t\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\t\t\t\t\t\tusername: \"alice\"\n\t\t\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t\t\t},\n\t\t\t\t\t\t\t\t\t\t\tonCreate: {\n\t\t\t\t\t\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\t\t\t\t\t\tusername: \"alice\"\n\t\t\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t  },\n\t\t\t\t\t\t}]\n\t\t\t\t\t}}\n        }]\n\t\t\t}\n      location: {\n        latitude: 33.392620\n        longitude: -111.940498\n      }\n      locationName: \"Yucca Tap Room\"\n      address: \"29 W Southern Ave, Tempe, AZ 85282\"\n      Poster: {\n        connectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t  node: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n      }\n      cost: \"Free\"\n      startTimeYear: \"2022\"\n      startTimeMonth: \"1\"\n      startTimeDayOfMonth: \"20\"\n      startTimeDayOfWeek: \"Thursday\"\n      startTimeHourOfDay: 20\n      canceled: false\n    },\n    {\n      title: \"NEW YEARS EVE with PAO!\",\n      description: \"DJ Lady Staliet\",\n      startTime: \"2021-12-31T05:21:37.146Z\",\n      endTime: \"2021-12-31T05:21:37.146Z\",\n      Channels: {\n\t\t\t\tconnectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t  node: {\n\t\t\t\t\t\t\tname: \"Phoenix Concerts\"\n              uniqueName: \"phx_concerts\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\tuniqueName: \"phx_concerts\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n      location: {\n        latitude: 33.449990\n        longitude: -112.074080\n      }\n      locationName: \"Valley Bar\"\n      address: \"130 N. Central Avenue, Phoenix, AZ, 85004\"\n      Poster: {\n        connectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t  node: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n      }\n      cost: \"$15, $5 service fee\"\n      startTimeYear: \"2021\"\n      startTimeMonth: \"12\"\n      startTimeDayOfMonth: \"31\"\n      startTimeDayOfWeek: \"Friday\"\n      startTimeHourOfDay: 20\n      canceled: false\n    },\n{\n      title: \"MOST NECESSARY HIP HOP\",\n      description: \"2015-PRESENT HIP HOP/TRAP\",\n      startTime: \"2021-12-25T05:21:37.146Z\",\n      endTime: \"2022-12-25T05:21:37.146Z\",\n      Channels: {\n\t\t\t\tconnectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t  node: {\n\t\t\t\t\t\t\tname: \"Phoenix Concerts\"\n              uniqueName: \"phx_concerts\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\tuniqueName: \"phx_concerts\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n      location: {\n        latitude: 33.449990\n        longitude: -112.074080\n      }\n      locationName: \"Valley Bar\"\n      address: \"130 N. Central Avenue, Phoenix, AZ, 85004\"\n      Poster: {\n        connectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t  node: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n      }\n      cost: \"Free\"\n      startTimeYear: \"2021\"\n      startTimeMonth: \"12\"\n      startTimeDayOfMonth: \"25\"\n      startTimeDayOfWeek: \"Saturday\"\n      startTimeHourOfDay: 22\n      canceled: false\n    },\n    {\n      title: \"Seinfeld Trivia: Festivus Edition\",\n      description: \"Hosted by Emily the Lewis\",\n      startTime: \"2021-12-23T05:21:37.146Z\",\n      endTime: \"2022-12-23T05:21:37.146Z\",\n      Channels: {\n\t\t\t\tconnectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t  node: {\n\t\t\t\t\t\t\tname: \"Phoenix Concerts\"\n              uniqueName: \"phx_concerts\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\tuniqueName: \"phx_concerts\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n      location: {\n        latitude: 33.449990\n        longitude: -112.074080\n      }\n      locationName: \"Valley Bar\"\n      address: \"130 N. Central Avenue, Phoenix, AZ, 85004\"\n      Poster: {\n        connectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t  node: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n      }\n      cost: \"$10, $5 service fee\"\n      startTimeYear: \"2021\"\n      startTimeMonth: \"12\"\n      startTimeDayOfMonth: \"23\"\n      startTimeDayOfWeek: \"Thursday\"\n      startTimeHourOfDay: 19\n      canceled: false\n\t\t\tTags: {\n\t\t\t\tconnectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t  text: \"trivia\"\n\t\t\t\t\t\t},\n\t\t\t\t\t},\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: { text: \"trivia \"}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n    },\n    {\n      title: \"Club Placebo Benefit Show\",\n      startTime: \"2022-01-08T05:21:37.146Z\",\n      endTime: \"2022-01-08T05:21:37.146Z\",\n      Channels: {\n\t\t\t\tconnectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t  node: {\n\t\t\t\t\t\t\tname: \"Phoenix Concerts\"\n              uniqueName: \"phx_concerts\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\tuniqueName: \"phx_concerts\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n      location: {\n        latitude: 33.448711\n        longitude: -112.083603\n      }\n      locationName: \"Crescent Ballroom\"\n      address: \"308 N 2nd Ave, Phoenix, AZ 85003\"\n      Poster: {\n        connectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t  node: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n      }\n      cost: \"$10, $5 service fee\"\n      startTimeYear: \"2022\"\n      startTimeMonth: \"1\"\n      startTimeDayOfMonth: \"8\"\n      startTimeDayOfWeek: \"Saturday\"\n      startTimeHourOfDay: 16\n      canceled: false\n\t\t\tTags: {\n\t\t\t\tconnectOrCreate: [{\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t  text: \"music\"\n\t\t\t\t\t\t},\n\t\t\t\t\t},\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: { text: \"music \"}\n\t\t\t\t\t}\n\t\t\t\t},{\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\ttext: \"charityEvent\"\n\t\t\t\t\t\t}\n\t\t\t\t\t},\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\ttext: \"charityEvent\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}]\n\t\t\t}\n    },\n    {\n      title: \"New Year'\''s Eve Block Party at Hance Park2\",\n      startTime: \"2021-12-31T02:21:37.146Z\",\n      endTime: \"2021-12-31T02:21:37.146Z\",\n      Channels: {\n\t\t\t\tconnectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t  node: {\n\t\t\t\t\t\t\tname: \"Phoenix Concerts\"\n              uniqueName: \"phx_concerts\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\tuniqueName: \"phx_concerts\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n      location: {\n        latitude: 33.462260\n        longitude: -112.074480\n      }\n      locationName: \"Margaret T. Hance Park\"\n      address: \"67 W Culver St., Phoenix, AZ, 85003\"\n      Poster: {\n        connectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t  node: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n      }\n      cost: \"$15\"\n      startTimeYear: \"2021\"\n      startTimeMonth: \"12\"\n      startTimeDayOfMonth: \"31\"\n      startTimeDayOfWeek: \"Friday\"\n      startTimeHourOfDay: 20\n      canceled: false\n\t\t\tTags: {\n\t\t\t\tconnectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t  text: \"newYears\"\n\t\t\t\t\t\t},\n\t\t\t\t\t},\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: { text: \"newYears \"}\n\t\t\t\t\t}\n\t\t\t\t}\n      }\n    },\n      {\n        title: \"Selena Night\",\n        startTime: \"2022-01-01T02:21:37.146Z\",\n        endTime: \"2022-01-01T02:21:37.146Z\",\n        Channels: {\n          connectOrCreate: {\n            onCreate: {\n              node: {\n                name: \"Phoenix Concerts\"\n                uniqueName: \"phx_concerts\"\n              }\n            }\n            where: {\n              node: {\n                uniqueName: \"phx_concerts\"\n              }\n            }\n\t\t\t\t}\n\t\t\t}\n      location: {\n        latitude: 33.448711\n        longitude: -112.083603\n      }\n      locationName: \"Crescent Ballroom\"\n      address: \"308 N 2nd Ave, Phoenix, AZ 85003\"\n      Poster: {\n        connectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t  node: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n      }\n      cost: \"$15\"\n      startTimeYear: \"2022\"\n      startTimeMonth: \"1\"\n      startTimeDayOfMonth: \"1\"\n      startTimeDayOfWeek: \"Saturday\"\n      startTimeHourOfDay: 20\n      canceled: false\n\t\t\tTags: {\n\t\t\t\tconnectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t  text: \"Selena\"\n\t\t\t\t\t\t},\n\t\t\t\t\t},\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: { text: \"Selena \"}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n    },\n    {\n      title: \"The Unlikely Candidates\",\n      description: \"The Criticals, The Deadbeat Cousins\"\n      startTime: \"2022-01-04T05:21:37.146Z\",\n      endTime: \"2022-01-04T05:21:37.146Z\",\n      Channels: {\n\t\t\t\tconnectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t  node: {\n\t\t\t\t\t\t\tname: \"Phoenix Concerts\"\n              uniqueName: \"phx_concerts\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\tuniqueName: \"phx_concerts\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n      location: {\n        latitude: 33.448711\n        longitude: -112.083603\n      }\n      locationName: \"Crescent Ballroom\"\n      address: \"308 N 2nd Ave, Phoenix, AZ 85003\"\n      Poster: {\n        connectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t  node: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n      }\n      cost: \"$18, $5 service fee\"\n      startTimeYear: \"2022\"\n      startTimeMonth: \"1\"\n      startTimeDayOfMonth: \"4\"\n      startTimeDayOfWeek: \"Tuesday\"\n      startTimeHourOfDay: 19\n      canceled: false\n    },\n    {\n      title: \"Desert Tails Benefit Show\",\n      description: \"feat. Ischemia, Atoll, Show-N-Tell, Nooses\",\n      startTime: \"2022-01-29T05:21:37.146Z\",\n      endTime: \"2022-01-20T05:21:37.146Z\",\n      Channels: {\n\t\t\t\tconnectOrCreate: [\n\t\t\t\t{\n\t\t\t\t\t\tonCreate: {\n\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\tname: \"Phoenix Music\"\n\t\t\t\t\t\t\t\tuniqueName: \"phx_concerts\"\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t\twhere: {\n\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\tuniqueName: \"phx_music\"\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t]\n\t\t\t}\n\t\t\tCommentSections: {\n\t\t\t\tcreate: [{\n\t\t\t\t\tnode: {\n\t\t\t\t\t\tChannel: { \n\t\t\t\t\t\t  connectOrCreate: { \n\t\t\t\t\t\t\t\tonCreate: {\n\t\t\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\t\t\tname: \"Phoenix Music\"\n\t\t\t\t\t\t\t\t\t\tuniqueName: \"phx_concerts\"\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\twhere: {\n\t\t\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\t\t\tuniqueName: \"phx_music\"\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t},\n\t\t\t\t\t  Comments: {\n\t\t\t\t\t\t  create: [{\n                node: {\n                  text: \"Comment1\"\n                  isRootComment: true\n                  CommentAuthor: {\n                    User: {\n                      connectOrCreate: {\n                        where: {\n                          node: {\n                            username: \"cluse\"\n                          }\n                        },\n                        onCreate: {\n                          node: {\n                            username: \"cluse\"\n                          }\n                        }\n                      }\n\t\t\t\t\t\t\t\t\t  }\n\t\t\t\t\t\t\t  \t}\n\t\t\t\t\t\t    },\n\t\t\t\t\t\t},{\n\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\ttext: \"Comment2\"\n\t\t\t\t\t\t\t  isRootComment: true\n\t\t\t\t\t\t\t\tCommentAuthor: {\n\t\t\t\t\t\t\t\t\tUser: {\n\t\t\t\t\t\t\t\t\t\tconnectOrCreate: {\n\t\t\t\t\t\t\t\t\t\t\twhere: {\n\t\t\t\t\t\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\t\t\t\t\t\tusername: \"alice\"\n\t\t\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t\t\t},\n\t\t\t\t\t\t\t\t\t\t\tonCreate: {\n\t\t\t\t\t\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\t\t\t\t\t\tusername: \"alice\"\n\t\t\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t  },\n\t\t\t\t\t\t}]\n\t\t\t\t\t}}\n        }]\n\t\t\t}\n      location: {\n        latitude: 33.392620\n        longitude: -111.940498\n      }\n      locationName: \"Yucca Tap Room\"\n      address: \"29 W Southern Ave, Tempe, AZ 85282\"\n      Poster: {\n        connectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t  node: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n      }\n      cost: \"DONTATIONS ENCOURAGED!\"\n      startTimeYear: \"2022\"\n      startTimeMonth: \"1\"\n      startTimeDayOfMonth: \"29\"\n      startTimeDayOfWeek: \"Saturday\"\n      startTimeHourOfDay: 20\n      canceled: false\n    },\n    {\n      title: \"OPEN MIC NIGHT\",\n      description: \"hosted by Haley Green, 8PM sign-up, 9PM music\",\n      startTime: \"2022-01-31T05:21:37.146Z\",\n      endTime: \"2022-01-31T05:21:37.146Z\",\n      Channels: {\n\t\t\t\tconnectOrCreate: [\n\t\t\t\t\t{\n\t\t\t\t\t\tonCreate: {\n\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\tname: \"Phoenix Concerts\"\n\t\t\t\t\t\t\t\tuniqueName: \"phx_concerts\"\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t\twhere: {\n\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\tuniqueName: \"phx_concerts\"\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t},{\n\t\t\t\t\t\tonCreate: {\n\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\tname: \"Phoenix Music\"\n\t\t\t\t\t\t\t\tuniqueName: \"phx_concerts\"\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t\twhere: {\n\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\tuniqueName: \"phx_music\"\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t]\n\t\t\t}\n      location: {\n        latitude: 33.392620\n        longitude: -111.940498\n      }\n      locationName: \"Yucca Tap Room\"\n      address: \"29 W Southern Ave, Tempe, AZ 85282\"\n      Poster: {\n        connectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t  node: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n      }\n      cost: \"0\"\n      startTimeYear: \"2022\"\n      startTimeMonth: \"1\"\n      startTimeDayOfMonth: \"31\"\n      startTimeDayOfWeek: \"Monday\"\n      startTimeHourOfDay: 21\n      canceled: false\n    },\n    {\n      title: \"STRFKR, The Undercover Dream Lovers, Das Kope\",\n      startTime: \"2022-02-25T02:20:00.146Z\",\n      endTime: \"2022-02-25T02:20:00.146Z\",\n      Channels: {\n\t\t\t\tconnectOrCreate: {\n\t\t\t\t\t\tonCreate: {\n\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\tname: \"Phoenix Music\"\n\t\t\t\t\t\t\t\tuniqueName: \"phx_concerts\"\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t\twhere: {\n\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\tuniqueName: \"phx_music\"\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\n\t\t\t}\n      location: {\n        latitude: 33.451130\n        longitude: -112.079193\n      }\n      locationName: \"The Van Buren\"\n      address: \"401 W Van Buren St, Phoenix, AZ 85003\"\n      Poster: {\n        connectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t  node: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n      }\n      cost: \"unknown\"\n      startTimeYear: \"2022\"\n      startTimeMonth: \"2\"\n      startTimeDayOfMonth: \"25\"\n      startTimeDayOfWeek: \"Friday\"\n      startTimeHourOfDay: 20\n      canceled: false\n    },\n    {\n      title: \"We Were Promised Jetpacks\",\n      startTime: \"2022-03-21T02:21:37.146Z\",\n      endTime: \"2022-03-21T02:21:37.146Z\",\n      Channels: {\n\t\t\t\tconnectOrCreate: [\n\t\t\t\t\t{\n\t\t\t\t\t\tonCreate: {\n\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\tname: \"Phoenix Concerts\"\n\t\t\t\t\t\t\t\tuniqueName: \"phx_concerts\"\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t\twhere: {\n\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\tuniqueName: \"phx_concerts\"\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t},\n\t\t\t\t]\n\t\t\t}\n      location: {\n        latitude: 33.494540\n        longitude: -112.032100\n      }\n      locationName: \"The Rebel Lounge\"\n      address: \"2303 E Indian School Rd, Phoenix, AZ 85016\"\n      Poster: {\n        connectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t  node: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\tusername: \"Alice\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n      }\n      cost: \"$20\"\n      startTimeYear: \"2022\"\n      startTimeMonth: \"3\"\n      startTimeDayOfMonth: \"21\"\n      startTimeDayOfWeek: \"Monday\"\n      startTimeHourOfDay: 20\n      canceled: false\n\t\t},\n\t\t{\n\t\t  title: \"Test free/virtual event\"\n\t\t\tstartTime: \"2022-04-21T02:21:37.146Z\"\n\t\t\tendTime: \"2022-04-21T02:21:37.146Z\"\n\t\t\tChannels: {\n\t\t\t\tconnectOrCreate: [\n\t\t\t\t\t{\n\t\t\t\t\t\tonCreate: {\n\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\tname: \"cats\"\n\t\t\t\t\t\t\t\tuniqueName: \"cats\"\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t\twhere: {\n\t\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\t\tuniqueName: \"cats\"\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t},\n\t\t\t\t]\n\t\t\t}\n\t\t\tvirtualEventUrl: \"example.com\"\n\t\t\tPoster: {\n        connectOrCreate: {\n\t\t\t\t\tonCreate: {\n\t\t\t\t\t  node: {\n\t\t\t\t\t\t\tusername: \"cluse\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\tusername: \"cluse\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n      }\n\t\t\tcost: \"0\"\n\t\t\tcanceled: false\n\t\t\tstartTimeYear: \"2022\"\n\t\t\tstartTimeMonth: \"April\"\n\t\t\tstartTimeDayOfMonth: \"21\"\n\t\t\tstartTimeDayOfWeek: \"Wednesday\"\n\t\t\tstartTimeHourOfDay: 20\n\t\t}\n  ]) {\n    events {\n      id\n      title\n      description\n      Channels {\n        uniqueName\n      }\n      Poster {\n        username\n      }\n      isInPrivateResidence\n      cost\n    }\n  }\n}"}'

# Create discussions
curl --request POST \
  --url http://localhost:4000/graphql \
  --header 'Content-Type: application/json' \
  --data '{"query":"mutation {\n  createDiscussions(input: [\n    {\n      title: \"test post\",\n      body: \"test\"\n      Channels: {\n\t\t\t\tconnect: {\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\tuniqueName: \"cats\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n      Author: {\n\t\t\t\tconnect: {\n\t\t\t\t\twhere: {\n\t\t\t\t\t\tnode: {\n\t\t\t\t\t\t\tusername: \"cluse\"\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n      }\n      \n    }\n  ]) {\n    discussions {\n      id\n      title\n      body\n      Channels {\n        uniqueName\n      }\n      Author {\n        username\n      }\n      CommentSections {\n        id\n        Comments {\n          text\n        }\n      }\n    }\n  }\n}\n"}'
```


The same test data can be created with mutations like this:
```
mutation {
	createChannels (input: [
		{ 
			uniqueName: "cats",
			name: "Cats"
		},{
			uniqueName: "dogs",
			name: "Dogs"
		},{
			uniqueName: "music",
			name: "Music"
		},{
			uniqueName: "phx_concerts",
			name: "Phoenix Concerts"
		}
	]
		
	){
		channels {
			uniqueName,
			name
		}
	}
}

mutation createThirteenEvents {
  createEvents(input: [
    {
      title: "GATHERING OF BONES",
      description: "with Arsenic Kitchen, Commiserate, Killing Sunday",
      startTime: "2022-01-20T05:21:37.146Z",
      endTime: "2022-01-20T05:21:37.146Z",
      Channels: {
				connect: {
						where: {
							node: {
								uniqueName: "phx_music"
							}
						}
					}
			}
			CommentSections: {
				create: [{
					node: {
						Channel: { 
						  connectOrCreate: { 
								onCreate: {
									node: {
										name: "Phoenix Music"
										uniqueName: "phx_music"
									}
								}
								where: {
									node: {
										uniqueName: "phx_music"
									}
								}
							}
						},
					  Comments: {
						  create: [{
                node: {
                  text: "Comment1"
                  isRootComment: true
                  CommentAuthor: {
                    User: {
                      connectOrCreate: {
                        where: {
                          node: {
                            username: "cluse"
                          }
                        },
                        onCreate: {
                          node: {
                            username: "cluse"
                          }
                        }
                      }
									  }
							  	}
						    },
						},{
							node: {
								text: "Comment2"
							  isRootComment: true
								CommentAuthor: {
									User: {
										connectOrCreate: {
											where: {
												node: {
													username: "alice"
												}
											},
											onCreate: {
												node: {
													username: "alice"
												}
											}
										}
									}
								}
						  },
						}]
					}}
        }]
			}
      location: {
        latitude: 33.392620
        longitude: -111.940498
      }
      locationName: "Yucca Tap Room"
      address: "29 W Southern Ave, Tempe, AZ 85282"
      Poster: {
        connectOrCreate: {
					onCreate: {
					  node: {
							username: "Alice"
						}
					}
					where: {
						node: {
							username: "Alice"
						}
					}
				}
      }
      cost: "Free"
      startTimeYear: "2022"
      startTimeMonth: "1"
      startTimeDayOfMonth: "20"
      startTimeDayOfWeek: "Thursday"
      startTimeHourOfDay: 20
      canceled: false
    },
    {
      title: "NEW YEARS EVE with PAO!",
      description: "DJ Lady Staliet",
      startTime: "2021-12-31T05:21:37.146Z",
      endTime: "2021-12-31T05:21:37.146Z",
      Channels: {
				connectOrCreate: {
					onCreate: {
					  node: {
							name: "Phoenix Concerts"
              uniqueName: "phx_concerts"
						}
					}
					where: {
						node: {
							uniqueName: "phx_concerts"
						}
					}
				}
			}
      location: {
        latitude: 33.449990
        longitude: -112.074080
      }
      locationName: "Valley Bar"
      address: "130 N. Central Avenue, Phoenix, AZ, 85004"
      Poster: {
        connectOrCreate: {
					onCreate: {
					  node: {
							username: "Alice"
						}
					}
					where: {
						node: {
							username: "Alice"
						}
					}
				}
      }
      cost: "$15, $5 service fee"
      startTimeYear: "2021"
      startTimeMonth: "12"
      startTimeDayOfMonth: "31"
      startTimeDayOfWeek: "Friday"
      startTimeHourOfDay: 20
      canceled: false
    },
{
      title: "MOST NECESSARY HIP HOP",
      description: "2015-PRESENT HIP HOP/TRAP",
      startTime: "2021-12-25T05:21:37.146Z",
      endTime: "2022-12-25T05:21:37.146Z",
      Channels: {
				connectOrCreate: {
					onCreate: {
					  node: {
							name: "Phoenix Concerts"
              uniqueName: "phx_concerts"
						}
					}
					where: {
						node: {
							uniqueName: "phx_concerts"
						}
					}
				}
			}
      location: {
        latitude: 33.449990
        longitude: -112.074080
      }
      locationName: "Valley Bar"
      address: "130 N. Central Avenue, Phoenix, AZ, 85004"
      Poster: {
        connectOrCreate: {
					onCreate: {
					  node: {
							username: "Alice"
						}
					}
					where: {
						node: {
							username: "Alice"
						}
					}
				}
      }
      cost: "Free"
      startTimeYear: "2021"
      startTimeMonth: "12"
      startTimeDayOfMonth: "25"
      startTimeDayOfWeek: "Saturday"
      startTimeHourOfDay: 22
      canceled: false
    },
    {
      title: "Seinfeld Trivia: Festivus Edition",
      description: "Hosted by Emily the Lewis",
      startTime: "2021-12-23T05:21:37.146Z",
      endTime: "2022-12-23T05:21:37.146Z",
      Channels: {
				connectOrCreate: {
					onCreate: {
					  node: {
							name: "Phoenix Concerts"
              uniqueName: "phx_concerts"
						}
					}
					where: {
						node: {
							uniqueName: "phx_concerts"
						}
					}
				}
			}
      location: {
        latitude: 33.449990
        longitude: -112.074080
      }
      locationName: "Valley Bar"
      address: "130 N. Central Avenue, Phoenix, AZ, 85004"
      Poster: {
        connectOrCreate: {
					onCreate: {
					  node: {
							username: "Alice"
						}
					}
					where: {
						node: {
							username: "Alice"
						}
					}
				}
      }
      cost: "$10, $5 service fee"
      startTimeYear: "2021"
      startTimeMonth: "12"
      startTimeDayOfMonth: "23"
      startTimeDayOfWeek: "Thursday"
      startTimeHourOfDay: 19
      canceled: false
			Tags: {
				connectOrCreate: {
					onCreate: {
						node: {
						  text: "trivia"
						},
					},
					where: {
						node: { text: "trivia "}
					}
				}
			}
    },
    {
      title: "Club Placebo Benefit Show",
      startTime: "2022-01-08T05:21:37.146Z",
      endTime: "2022-01-08T05:21:37.146Z",
      Channels: {
				connectOrCreate: {
					onCreate: {
					  node: {
							name: "Phoenix Concerts"
              uniqueName: "phx_concerts"
						}
					}
					where: {
						node: {
							uniqueName: "phx_concerts"
						}
					}
				}
			}
      location: {
        latitude: 33.448711
        longitude: -112.083603
      }
      locationName: "Crescent Ballroom"
      address: "308 N 2nd Ave, Phoenix, AZ 85003"
      Poster: {
        connectOrCreate: {
					onCreate: {
					  node: {
							username: "Alice"
						}
					}
					where: {
						node: {
							username: "Alice"
						}
					}
				}
      }
      cost: "$10, $5 service fee"
      startTimeYear: "2022"
      startTimeMonth: "1"
      startTimeDayOfMonth: "8"
      startTimeDayOfWeek: "Saturday"
      startTimeHourOfDay: 16
      canceled: false
			Tags: {
				connectOrCreate: [{
					onCreate: {
						node: {
						  text: "music"
						},
					},
					where: {
						node: { text: "music "}
					}
				},{
					onCreate: {
						node: {
							text: "charityEvent"
						}
					},
					where: {
						node: {
							text: "charityEvent"
						}
					}
				}]
			}
    },
    {
      title: "New Year's Eve Block Party at Hance Park2",
      startTime: "2021-12-31T02:21:37.146Z",
      endTime: "2021-12-31T02:21:37.146Z",
      Channels: {
				connectOrCreate: {
					onCreate: {
					  node: {
							name: "Phoenix Concerts"
              uniqueName: "phx_concerts"
						}
					}
					where: {
						node: {
							uniqueName: "phx_concerts"
						}
					}
				}
			}
      location: {
        latitude: 33.462260
        longitude: -112.074480
      }
      locationName: "Margaret T. Hance Park"
      address: "67 W Culver St., Phoenix, AZ, 85003"
      Poster: {
        connectOrCreate: {
					onCreate: {
					  node: {
							username: "Alice"
						}
					}
					where: {
						node: {
							username: "Alice"
						}
					}
				}
      }
      cost: "$15"
      startTimeYear: "2021"
      startTimeMonth: "12"
      startTimeDayOfMonth: "31"
      startTimeDayOfWeek: "Friday"
      startTimeHourOfDay: 20
      canceled: false
			Tags: {
				connectOrCreate: {
					onCreate: {
						node: {
						  text: "newYears"
						},
					},
					where: {
						node: { text: "newYears "}
					}
				}
      }
    },
      {
        title: "Selena Night",
        startTime: "2022-01-01T02:21:37.146Z",
        endTime: "2022-01-01T02:21:37.146Z",
        Channels: {
          connectOrCreate: {
            onCreate: {
              node: {
                name: "Phoenix Concerts"
                uniqueName: "phx_concerts"
              }
            }
            where: {
              node: {
                uniqueName: "phx_concerts"
              }
            }
				}
			}
      location: {
        latitude: 33.448711
        longitude: -112.083603
      }
      locationName: "Crescent Ballroom"
      address: "308 N 2nd Ave, Phoenix, AZ 85003"
      Poster: {
        connectOrCreate: {
					onCreate: {
					  node: {
							username: "Alice"
						}
					}
					where: {
						node: {
							username: "Alice"
						}
					}
				}
      }
      cost: "$15"
      startTimeYear: "2022"
      startTimeMonth: "1"
      startTimeDayOfMonth: "1"
      startTimeDayOfWeek: "Saturday"
      startTimeHourOfDay: 20
      canceled: false
			Tags: {
				connectOrCreate: {
					onCreate: {
						node: {
						  text: "Selena"
						},
					},
					where: {
						node: { text: "Selena "}
					}
				}
			}
    },
    {
      title: "The Unlikely Candidates",
      description: "The Criticals, The Deadbeat Cousins"
      startTime: "2022-01-04T05:21:37.146Z",
      endTime: "2022-01-04T05:21:37.146Z",
      Channels: {
				connectOrCreate: {
					onCreate: {
					  node: {
							name: "Phoenix Concerts"
              uniqueName: "phx_concerts"
						}
					}
					where: {
						node: {
							uniqueName: "phx_concerts"
						}
					}
				}
			}
      location: {
        latitude: 33.448711
        longitude: -112.083603
      }
      locationName: "Crescent Ballroom"
      address: "308 N 2nd Ave, Phoenix, AZ 85003"
      Poster: {
        connectOrCreate: {
					onCreate: {
					  node: {
							username: "Alice"
						}
					}
					where: {
						node: {
							username: "Alice"
						}
					}
				}
      }
      cost: "$18, $5 service fee"
      startTimeYear: "2022"
      startTimeMonth: "1"
      startTimeDayOfMonth: "4"
      startTimeDayOfWeek: "Tuesday"
      startTimeHourOfDay: 19
      canceled: false
    },
    {
      title: "Desert Tails Benefit Show",
      description: "feat. Ischemia, Atoll, Show-N-Tell, Nooses",
      startTime: "2022-01-29T05:21:37.146Z",
      endTime: "2022-01-20T05:21:37.146Z",
      Channels: {
				connectOrCreate: [
				{
						onCreate: {
							node: {
								name: "Phoenix Music"
								uniqueName: "phx_concerts"
							}
						}
						where: {
							node: {
								uniqueName: "phx_music"
							}
						}
					}
				]
			}
			CommentSections: {
				create: [{
					node: {
						Channel: { 
						  connectOrCreate: { 
								onCreate: {
									node: {
										name: "Phoenix Music"
										uniqueName: "phx_concerts"
									}
								}
								where: {
									node: {
										uniqueName: "phx_music"
									}
								}
							}
						},
					  Comments: {
						  create: [{
                node: {
                  text: "Comment1"
                  isRootComment: true
                  CommentAuthor: {
                    User: {
                      connectOrCreate: {
                        where: {
                          node: {
                            username: "cluse"
                          }
                        },
                        onCreate: {
                          node: {
                            username: "cluse"
                          }
                        }
                      }
									  }
							  	}
						    },
						},{
							node: {
								text: "Comment2"
							  isRootComment: true
								CommentAuthor: {
									User: {
										connectOrCreate: {
											where: {
												node: {
													username: "alice"
												}
											},
											onCreate: {
												node: {
													username: "alice"
												}
											}
										}
									}
								}
						  },
						}]
					}}
        }]
			}
      location: {
        latitude: 33.392620
        longitude: -111.940498
      }
      locationName: "Yucca Tap Room"
      address: "29 W Southern Ave, Tempe, AZ 85282"
      Poster: {
        connectOrCreate: {
					onCreate: {
					  node: {
							username: "Alice"
						}
					}
					where: {
						node: {
							username: "Alice"
						}
					}
				}
      }
      cost: "DONTATIONS ENCOURAGED!"
      startTimeYear: "2022"
      startTimeMonth: "1"
      startTimeDayOfMonth: "29"
      startTimeDayOfWeek: "Saturday"
      startTimeHourOfDay: 20
      canceled: false
    },
    {
      title: "OPEN MIC NIGHT",
      description: "hosted by Haley Green, 8PM sign-up, 9PM music",
      startTime: "2022-01-31T05:21:37.146Z",
      endTime: "2022-01-31T05:21:37.146Z",
      Channels: {
				connectOrCreate: [
					{
						onCreate: {
							node: {
								name: "Phoenix Concerts"
								uniqueName: "phx_concerts"
							}
						}
						where: {
							node: {
								uniqueName: "phx_concerts"
							}
						}
					},{
						onCreate: {
							node: {
								name: "Phoenix Music"
								uniqueName: "phx_concerts"
							}
						}
						where: {
							node: {
								uniqueName: "phx_music"
							}
						}
					}
				]
			}
      location: {
        latitude: 33.392620
        longitude: -111.940498
      }
      locationName: "Yucca Tap Room"
      address: "29 W Southern Ave, Tempe, AZ 85282"
      Poster: {
        connectOrCreate: {
					onCreate: {
					  node: {
							username: "Alice"
						}
					}
					where: {
						node: {
							username: "Alice"
						}
					}
				}
      }
      cost: "0"
      startTimeYear: "2022"
      startTimeMonth: "1"
      startTimeDayOfMonth: "31"
      startTimeDayOfWeek: "Monday"
      startTimeHourOfDay: 21
      canceled: false
    },
    {
      title: "STRFKR, The Undercover Dream Lovers, Das Kope",
      startTime: "2022-02-25T02:20:00.146Z",
      endTime: "2022-02-25T02:20:00.146Z",
      Channels: {
				connectOrCreate: {
						onCreate: {
							node: {
								name: "Phoenix Music"
								uniqueName: "phx_concerts"
							}
						}
						where: {
							node: {
								uniqueName: "phx_music"
							}
						}
					}
				
			}
      location: {
        latitude: 33.451130
        longitude: -112.079193
      }
      locationName: "The Van Buren"
      address: "401 W Van Buren St, Phoenix, AZ 85003"
      Poster: {
        connectOrCreate: {
					onCreate: {
					  node: {
							username: "Alice"
						}
					}
					where: {
						node: {
							username: "Alice"
						}
					}
				}
      }
      cost: "unknown"
      startTimeYear: "2022"
      startTimeMonth: "2"
      startTimeDayOfMonth: "25"
      startTimeDayOfWeek: "Friday"
      startTimeHourOfDay: 20
      canceled: false
    },
    {
      title: "We Were Promised Jetpacks",
      startTime: "2022-03-21T02:21:37.146Z",
      endTime: "2022-03-21T02:21:37.146Z",
      Channels: {
				connectOrCreate: [
					{
						onCreate: {
							node: {
								name: "Phoenix Concerts"
								uniqueName: "phx_concerts"
							}
						}
						where: {
							node: {
								uniqueName: "phx_concerts"
							}
						}
					},
				]
			}
      location: {
        latitude: 33.494540
        longitude: -112.032100
      }
      locationName: "The Rebel Lounge"
      address: "2303 E Indian School Rd, Phoenix, AZ 85016"
      Poster: {
        connectOrCreate: {
					onCreate: {
					  node: {
							username: "Alice"
						}
					}
					where: {
						node: {
							username: "Alice"
						}
					}
				}
      }
      cost: "$20"
      startTimeYear: "2022"
      startTimeMonth: "3"
      startTimeDayOfMonth: "21"
      startTimeDayOfWeek: "Monday"
      startTimeHourOfDay: 20
      canceled: false
		},
		{
		  title: "Test free/virtual event"
			startTime: "2022-04-21T02:21:37.146Z"
			endTime: "2022-04-21T02:21:37.146Z"
			Channels: {
				connectOrCreate: [
					{
						onCreate: {
							node: {
								name: "cats"
								uniqueName: "cats"
							}
						}
						where: {
							node: {
								uniqueName: "cats"
							}
						}
					},
				]
			}
			virtualEventUrl: "example.com"
			Poster: {
        connectOrCreate: {
					onCreate: {
					  node: {
							username: "cluse"
						}
					}
					where: {
						node: {
							username: "cluse"
						}
					}
				}
      }
			cost: "0"
			canceled: false
			startTimeYear: "2022"
			startTimeMonth: "April"
			startTimeDayOfMonth: "21"
			startTimeDayOfWeek: "Wednesday"
			startTimeHourOfDay: 20
		}
  ]) {
    events {
      id
      title
      description
      Channels {
        uniqueName
      }
      Poster {
        username
      }
      isInPrivateResidence
      cost
    }
  }
}

mutation {
  createDiscussions(input: [
    {
      title: "test post",
      body: "test"
      Channels: {
				connect: {
					where: {
						node: {
							uniqueName: "cats"
						}
					}
				}
			}
      Author: {
				connect: {
					where: {
						node: {
							username: "cluse"
						}
					}
				}
      }
      
    }
  ]) {
    discussions {
      id
      title
      body
      Channels {
        uniqueName
      }
      Author {
        username
      }
      CommentSections {
        id
        Comments {
          text
        }
      }
    }
  }
}


```