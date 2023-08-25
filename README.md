## Description

TBD

## publish on npm

1. change version on package/api/package.json
2. run cli

```
npm run package:publish
```

## DB migration

## Installation

```bash
$ npm install
```

## DB migration
.env is for database only

### run migrate

```bash
npx prisma migrate
npx prisma generate
```

### apply migrate

```bash
npx prisma migrate deploy
```

### how to create sechema

1. write schema on ./prisma/schema.prisma
2. run this code with proper name

```bash(example)
npx prisma migrate dev --name add_index_to_created_at
```

- after that, new schema and ddl is created

3. all done, if you apply this to other env, try 'apply migrate' on that server

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

TBD
