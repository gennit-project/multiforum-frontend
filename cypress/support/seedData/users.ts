const users = [
  {
    username: "cluse",
    Email: {
      connect: {
        where: {
          node: {
            address: "catherine.luse@gmail.com",
          },
        },
      },
    },
  },
  {
    username: "alice",
    Email: {
      connect: {
        where: {
          node: {
            address: "the.rinnovator@gmail.com",
          },
        },
      },
    },
  },
];
export default users;
