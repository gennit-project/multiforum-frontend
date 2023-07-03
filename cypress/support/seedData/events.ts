const events = [
  {
    title: "GATHERING OF BONES",
    description: "with Arsenic Kitchen, Commiserate, Killing Sunday",
    startTime: "2024-01-20T05:21:37.146Z",
    endTime: "2024-01-20T05:21:37.146Z",
    Channels: {
      connect: {
        where: {
          node: {
            uniqueName: "phx_music",
          },
        },
      },
    },
    location: {
      latitude: 33.39262,
      longitude: -111.940498,
    },
    locationName: "Yucca Tap Room",
    address: "29 W Southern Ave, Tempe, AZ 85282",
    Poster: {
      connect: {
        where: {
          node: {
            username: "Alice",
          },
        },
      },
    },
    cost: "Free",
    startTimeYear: "2024",
    startTimeMonth: "1",
    startTimeDayOfMonth: "20",
    startTimeDayOfWeek: "Thursday",
    startTimeHourOfDay: 20,
    canceled: false,
  },
  {
    title: "NEW YEARS EVE with PAO!",
    description: "DJ Lady Staliet",
    startTime: "2024-12-31T05:21:37.146Z",
    endTime: "2024-12-31T05:21:37.146Z",
    Channels: {
      connect: {
        where: {
          node: {
            uniqueName: "phx_concerts",
          },
        },
      },
    },
    location: {
      latitude: 33.44999,
      longitude: -112.07408,
    },
    locationName: "Valley Bar",
    address: "130 N. Central Avenue, Phoenix, AZ, 85004",
    Poster: {
      connect: {
        where: {
          node: {
            username: "Alice",
          },
        },
      },
    },
    cost: "$15, $5 service fee",
    startTimeYear: "2024",
    startTimeMonth: "12",
    startTimeDayOfMonth: "31",
    startTimeDayOfWeek: "Friday",
    startTimeHourOfDay: 20,
    canceled: false,
  },
  {
    title: "MOST NECESSARY HIP HOP",
    description: "2015-PRESENT HIP HOP/TRAP",
    startTime: "2024-12-25T05:21:37.146Z",
    endTime: "2024-12-25T05:21:37.146Z",
    Channels: {
      connect: {
        where: {
          node: {
            uniqueName: "phx_concerts",
          },
        },
      },
    },
    location: {
      latitude: 33.44999,
      longitude: -112.07408,
    },
    locationName: "Valley Bar",
    address: "130 N. Central Avenue, Phoenix, AZ, 85004",
    Poster: {
      connect: {
        where: {
          node: {
            username: "Alice",
          },
        },
      },
    },
    cost: "Free",
    startTimeYear: "2024",
    startTimeMonth: "12",
    startTimeDayOfMonth: "25",
    startTimeDayOfWeek: "Saturday",
    startTimeHourOfDay: 22,
    canceled: false,
  },
  {
    title: "Seinfeld Trivia: Festivus Edition",
    description: "Hosted by Emily the Lewis",
    startTime: "2024-12-23T05:21:37.146Z",
    endTime: "2024-12-23T05:21:37.146Z",
    Channels: {
      connect: {
        where: {
          node: {
            uniqueName: "phx_concerts",
          },
        },
      },
    },
    location: {
      latitude: 33.44999,
      longitude: -112.07408,
    },
    locationName: "Valley Bar",
    address: "130 N. Central Avenue, Phoenix, AZ, 85004",
    Poster: {
      connect: {
        where: {
          node: {
            username: "Alice",
          },
        },
      },
    },
    cost: "$10, $5 service fee",
    startTimeYear: "2024",
    startTimeMonth: "12",
    startTimeDayOfMonth: "23",
    startTimeDayOfWeek: "Thursday",
    startTimeHourOfDay: 19,
    canceled: false,
    Tags: {
      connect: {
        where: {
          node: { text: "trivia " },
        },
      },
    },
  },
  {
    title: "Club Placebo Benefit Show",
    startTime: "2024-01-08T05:21:37.146Z",
    endTime: "2024-01-08T05:21:37.146Z",
    Channels: {
      connect: {
        where: {
          node: {
            uniqueName: "phx_concerts",
          },
        },
      },
    },
    location: {
      latitude: 33.448711,
      longitude: -112.083603,
    },
    locationName: "Crescent Ballroom",
    address: "308 N 2nd Ave, Phoenix, AZ 85003",
    Poster: {
      connect: {
        where: {
          node: {
            username: "Alice",
          },
        },
      },
    },
    cost: "$10, $5 service fee",
    startTimeYear: "2022",
    startTimeMonth: "1",
    startTimeDayOfMonth: "8",
    startTimeDayOfWeek: "Saturday",
    startTimeHourOfDay: 16,
    canceled: false,
    Tags: {
      connect: [
        {
          where: {
            node: { text: "music " },
          },
        },
        {
          where: {
            node: {
              text: "charityEvent",
            },
          },
        },
      ],
    },
  },
  {
    title: "New Year's Eve Block Party at Hance Park2",
    startTime: "2024-12-31T02:21:37.146Z",
    endTime: "2024-12-31T02:21:37.146Z",
    Channels: {
      connect: {
        where: {
          node: {
            uniqueName: "phx_concerts",
          },
        },
      },
    },
    location: {
      latitude: 33.46226,
      longitude: -112.07448,
    },
    locationName: "Margaret T. Hance Park",
    address: "67 W Culver St., Phoenix, AZ, 85003",
    Poster: {
      connect: {
        where: {
          node: {
            username: "Alice",
          },
        },
      },
    },
    cost: "$15",
    startTimeYear: "2024",
    startTimeMonth: "12",
    startTimeDayOfMonth: "31",
    startTimeDayOfWeek: "Friday",
    startTimeHourOfDay: 20,
    canceled: false,
    Tags: {
      connect: {
        where: {
          node: { text: "newYears " },
        },
      },
    },
  },
  {
    title: "Selena Night",
    startTime: "2024-01-01T02:21:37.146Z",
    endTime: "2024-01-01T02:21:37.146Z",
    Channels: {
      connect: {
        where: {
          node: {
            uniqueName: "phx_concerts",
          },
        },
      },
    },
    location: {
      latitude: 33.448711,
      longitude: -112.083603,
    },
    locationName: "Crescent Ballroom",
    address: "308 N 2nd Ave, Phoenix, AZ 85003",
    Poster: {
      connect: {
        where: {
          node: {
            username: "Alice",
          },
        },
      },
    },
    cost: "$15",
    startTimeYear: "2024",
    startTimeMonth: "1",
    startTimeDayOfMonth: "1",
    startTimeDayOfWeek: "Saturday",
    startTimeHourOfDay: 20,
    canceled: false,
    Tags: {
      connect: {
        where: {
          node: { text: "Selena " },
        },
      },
    },
  },
  {
    title: "The Unlikely Candidates",
    description: "The Criticals, The Deadbeat Cousins",
    startTime: "2024-01-04T05:21:37.146Z",
    endTime: "2024-01-04T05:21:37.146Z",
    Channels: {
      connect: {
        where: {
          node: {
            uniqueName: "phx_concerts",
          },
        },
      },
    },
    location: {
      latitude: 33.448711,
      longitude: -112.083603,
    },
    locationName: "Crescent Ballroom",
    address: "308 N 2nd Ave, Phoenix, AZ 85003",
    Poster: {
      connect: {
        where: {
          node: {
            username: "Alice",
          },
        },
      },
    },
    cost: "$18, $5 service fee",
    startTimeYear: "2024",
    startTimeMonth: "1",
    startTimeDayOfMonth: "4",
    startTimeDayOfWeek: "Tuesday",
    startTimeHourOfDay: 19,
    canceled: false,
  },
  {
    title: "Desert Tails Benefit Show",
    description: "feat. Ischemia, Atoll, Show-N-Tell, Nooses",
    startTime: "2024-01-29T05:21:37.146Z",
    endTime: "2024-01-20T05:21:37.146Z",
    Channels: {
      connect: [
        {
          where: {
            node: {
              uniqueName: "phx_music",
            },
          },
        },
      ],
    },
    location: {
      latitude: 33.39262,
      longitude: -111.940498,
    },
    locationName: "Yucca Tap Room",
    address: "29 W Southern Ave, Tempe, AZ 85282",
    Poster: {
      connect: {
        where: {
          node: {
            username: "Alice",
          },
        },
      },
    },
    cost: "DONTATIONS ENCOURAGED!",
    startTimeYear: "2024",
    startTimeMonth: "1",
    startTimeDayOfMonth: "29",
    startTimeDayOfWeek: "Saturday",
    startTimeHourOfDay: 20,
    canceled: false,
  },
  {
    title: "OPEN MIC NIGHT",
    description: "hosted by Haley Green, 8PM sign-up, 9PM music",
    startTime: "2024-01-31T05:21:37.146Z",
    endTime: "2024-01-31T05:21:37.146Z",
    Channels: {
      connect: [
        {
          where: {
            node: {
              uniqueName: "phx_concerts",
            },
          },
        },
        {
          where: {
            node: {
              uniqueName: "phx_music",
            },
          },
        },
      ],
    },
    location: {
      latitude: 33.39262,
      longitude: -111.940498,
    },
    locationName: "Yucca Tap Room",
    address: "29 W Southern Ave, Tempe, AZ 85282",
    Poster: {
      connect: {
        where: {
          node: {
            username: "Alice",
          },
        },
      },
    },
    cost: "0",
    startTimeYear: "2024",
    startTimeMonth: "1",
    startTimeDayOfMonth: "31",
    startTimeDayOfWeek: "Monday",
    startTimeHourOfDay: 21,
    canceled: false,
  },
  {
    title: "STRFKR, The Undercover Dream Lovers, Das Kope",
    startTime: "2024-02-25T02:20:00.146Z",
    endTime: "2024-02-25T02:20:00.146Z",
    Channels: {
      connect: {
        where: {
          node: {
            uniqueName: "phx_music",
          },
        },
      },
    },
    location: {
      latitude: 33.45113,
      longitude: -112.079193,
    },
    locationName: "The Van Buren",
    address: "401 W Van Buren St, Phoenix, AZ 85003",
    Poster: {
      connect: {
        where: {
          node: {
            username: "Alice",
          },
        },
      },
    },
    cost: "unknown",
    startTimeYear: "2024",
    startTimeMonth: "2",
    startTimeDayOfMonth: "25",
    startTimeDayOfWeek: "Friday",
    startTimeHourOfDay: 20,
    canceled: false,
  },
  {
    title: "We Were Promised Jetpacks",
    startTime: "2024-03-21T02:21:37.146Z",
    endTime: "2024-03-21T02:21:37.146Z",
    Channels: {
      connect: [
        {
          where: {
            node: {
              uniqueName: "phx_concerts",
            },
          },
        },
      ],
    },
    location: {
      latitude: 33.49454,
      longitude: -112.0321,
    },
    locationName: "The Rebel Lounge",
    address: "2303 E Indian School Rd, Phoenix, AZ 85016",
    Poster: {
      connect: {
        where: {
          node: {
            username: "Alice",
          },
        },
      },
    },
    cost: "$20",
    startTimeYear: "2024",
    startTimeMonth: "3",
    startTimeDayOfMonth: "21",
    startTimeDayOfWeek: "Monday",
    startTimeHourOfDay: 20,
    canceled: false,
  },
  {
    title: "Test free/virtual event",
    startTime: "2024-04-21T02:21:37.146Z",
    endTime: "2024-04-21T02:21:37.146Z",
    Channels: {
      connect: [
        {
          where: {
            node: {
              uniqueName: "cats",
            },
          },
        },
      ],
    },
    virtualEventUrl: "example.com",
    Poster: {
      connect: {
        where: {
          node: {
            username: "cluse",
          },
        },
      },
    },
    cost: "0",
    canceled: false,
    startTimeYear: "2024",
    startTimeMonth: "April",
    startTimeDayOfMonth: "21",
    startTimeDayOfWeek: "Wednesday",
    startTimeHourOfDay: 20,
  },
];

export default events;
