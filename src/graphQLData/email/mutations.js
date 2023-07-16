import { gql } from "@apollo/client/core";

export const GET_EMAIL = gql`
  query getEmail($emailAddress: String!) {
    emails(where: { address: $emailAddress }) {
      address
      User {
        username
      }
    }
  }
`;

export const CREATE_EMAIL_AND_USER = gql`
  mutation createEmailAndUser($emailAddress: String!, $username: String!) {
    createEmails(
      input: [
        {
          address: $emailAddress
          User: { create: { node: { username: $username } } }
        }
      ]
    ) {
      emails {
        address
        User {
          username
        }
      }
    }
  }
`;

export const LINK_USER_TO_EMAIL = gql`
  mutation linkUser($emailAddress: String!, $username: String!) {
    updateUsers(
      where: { username: $username }
      connect: { Email: { where: { node: { address: $emailAddress } } } }
    ) {
      users {
        Email {
          address
          User {
            username
          }
        }
      }
    }
  }
`;
