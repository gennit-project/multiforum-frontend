const channels = [
  {
    uniqueName: "cats",
    Admins: {
      connect: {
        where: {
          node: {
            username: "cluse",
          },
        },
      },
    },
  },
  {
    uniqueName: "phx_music",
    Admins: {
      connect: {
        where: {
          node: {
            username: "alice",
          },
        },
      },
    },
  },
];

export default channels;
