## Claims based authorization in Nest.js and GraphQL

In this example, we will use [Nest.js](https://nestjs.com/) and [GraphQL](https://graphql.org/) to implement a simple claims based authorization.

Each user has a role and each role has a set of permissions. We will implement the following permissions (you can find it in the seeding file [here](./prisma/seed.ts)):

- `ADMIN` role has:
  - `GENERAL_ADMIN_PERMISSION`
  - `GENERAL_USER_PERMISSION`
  - `BLOCK_USER_PERMISSION`
- `USER` role has:
  - `GENERAL_USER_PERMISSION`

### Technologies

- [Nest.js](https://nestjs.com/)
- [GraphQL](https://graphql.org/)
- [@apollo/server](https://github.com/apollographql/apollo-server)
- [Prisma](https://www.prisma.io/)
- [Passport](https://github.com/jaredhanson/passport)
- [passport-jwt](https://github.com/mikenicholson/passport-jwt)

### Usage

We use a Guard to protect our GraphQL resolvers. The [guard](./src/auth/guards/accessToken.guard.ts) will check if the user has the required permission to access the resolver.

[Example:](./src/auth/auth.resolver.ts)

```typescript
// No permissions required -> public
@Query(() => String)
public() {
return 'hello! This query is public!';
}

// Only users with the GENERAL_ADMIN_PERMISSION can query this
@Permissions(Permission.GENERAL_ADMIN_PERMISSION)
@Query(() => String)
adminCanQuery() {
return 'hello admin!';
}

// Both users with the GENERAL_ADMIN_PERMISSION and GENERAL_USER_PERMISSION can query this
@Permissions(
Permission.GENERAL_ADMIN_PERMISSION,
Permission.GENERAL_USER_PERMISSION,
)
@Query(() => String)
adminAndUserCanQuery() {
return 'hello admin and user!';
}

```

### Run the application

#### Prerequisites

- [Node.js](https://nodejs.org/en/)
- [MySQL](https://www.mysql.com/) or any relational database supported by [Prisma](https://www.prisma.io/)

#### Install dependencies

```bash
npm install
```

or

```bash
yarn
```

#### Create .env file

```bash
cp .env.example .env
```

Then fill the .env file with your own values.

#### Initialize and seed database

```bash
npx prisma migrate dev --name init-db
```

#### Start application

```bash
$ npm run start:dev
```

or

```bash
$ yarn start:dev
```

The application will be running on [http://localhost:3333/graphql](http://localhost:3333/graphql)

#### Play around with the API

- Signin as admin

  ```bash
  POST /graphql HTTP/1.1
  Content-Length: 239
  Content-Type: application/json
  Host: localhost:3333
  User-Agent: HTTPie

  {"query":"mutation Signin($email: String!, $password: String!) {\n  signin(signInInput: {email: $email, password: $password}) {\n    accessToken\n    refreshToken\n  }\n}","variables":{
  "email": "admin@email.com",
  "password": "1234"
  }}
  ```

- Signin as user

  ```bash
  POST /graphql HTTP/1.1
  Content-Length: 239
  Content-Type: application/json
  Host: localhost:3333
  User-Agent: HTTPie

  {"query":"mutation Signin($email: String!, $password: String!) {\n  signin(signInInput: {email: $email, password: $password}) {\n    accessToken\n    refreshToken\n  }\n}","variables":{
  "email": "user1@email.com",
  "password": "1234"
  }}
  ```

- Renew tokens using refresh token (populate the `Token-Id` header and `refreshToken` as Authorization Bearer from the previous response)

  ```bash
  POST /graphql HTTP/1.1
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMGZmNWJhNC1lYjgzLTRkNWMtOGYwYy1kNWNkZWMwMzlkNzgiLCJlbWFpbCI6ImFkbWluQGVtYWlsLmNvbSIsInBlcm1pc3Npb25zIjpbIkdFTkVSQUxfQURNSU5fUEVSTUlTU0lPTiIsIkdFTkVSQUxfVVNFUl9QRVJNSVNTSU9OIiwiQkxPQ0tfVVNFUiJdLCJpYXQiOjE2OTk1ODM5MDQsImV4cCI6MTY5OTY3MDMwNH0.qFSLbUyREeeSG7Ks9wWphr7JeyoLkxkDZj6LCNgEI2A
  Content-Length: 115
  Content-Type: application/json
  Host: localhost:3333
  Token-Id: 45604e24-51a4-4bf4-9f50-63fcb2ea8114
  User-Agent: HTTPie

  {"query":"mutation getRefreshToken {\n  getRefreshToken {\n    accessToken\n    refreshToken\n    tokenId\n  }\n}"}
  ```

- Get all users (only admin)

  ```bash
  POST /graphql HTTP/1.1
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMGZmNWJhNC1lYjgzLTRkNWMtOGYwYy1kNWNkZWMwMzlkNzgiLCJlbWFpbCI6ImFkbWluQGVtYWlsLmNvbSIsInBlcm1pc3Npb25zIjpbIkdFTkVSQUxfQURNSU5fUEVSTUlTU0lPTiIsIkdFTkVSQUxfVVNFUl9QRVJNSVNTSU9OIiwiQkxPQ0tfVVNFUiJdLCJpYXQiOjE2OTk1ODIwNjUsImV4cCI6MTY5OTU4Mjk2NX0.drFKiXsdq4uTGVrEC7lLElP9js2FVhtigx0YKJB-Iko
  Content-Length: 104
  Content-Type: application/json
  Host: localhost:3333
  User-Agent: HTTPie

  {"query":"query findAllUser {\n  findAllUser {\n    id\n    email\n    firstName\n    lastName\n  }\n}"}
  ```

### License

[MIT licensed](LICENSE).
