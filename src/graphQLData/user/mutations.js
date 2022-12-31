import { gql } from "@apollo/client/core";


export const CREATE_USER = gql`
  mutation createUser($username: String!){
    createUsers(input: [
        { username: $username }
    ]) {
        users {
            username
        }
    }
}
`;
