import { UserCreateInput } from "../../../src/__generated__/graphql";

const users: UserCreateInput[] = [
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
  {
    username: "eleanorperaltamontoya",
    Email: {
      connect: {
        where: {
          node: {
            address: "eleanorperaltamontoya@gmail.com",
          },
        },
      },
    },
  }
];
export default users;
