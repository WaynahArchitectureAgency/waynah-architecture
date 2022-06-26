/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getTodo = /* GraphQL */ `
  query GetTodo($id: ID!) {
    getTodo(id: $id) {
      id
      title
      content
      email
      coverImage
      images
      page
      language
      dateAndLocation
      createdAt
      updatedAt
    }
  }
`;
export const listTodos = /* GraphQL */ `
  query ListTodos(
    $filter: ModelTodoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTodos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        content
        email
        coverImage
        images
        page
        language
        dateAndLocation
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const postsByEmail = /* GraphQL */ `
  query PostsByEmail(
    $email: String!
    $sortDirection: ModelSortDirection
    $filter: ModelTodoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    postsByEmail(
      email: $email
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        title
        content
        email
        coverImage
        images
        page
        language
        dateAndLocation
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
