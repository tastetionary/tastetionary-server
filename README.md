## Description

TBD

## Getting Started

Create .env file

```bash
cp .env.sample .env
```

## publish on npm

1. change version on package/api/package.json
2. run cli

```
npm run package:publish
```

## integration test(only for vscode)

1. install vscode extension > REST Client

- https://marketplace.visualstudio.com/items?itemName=humao.rest-client

2. add this to .vscode/settings.json

```json
{ ...
	"rest-client.environmentVariables": {
		"$shared": {
			"version": "v1",
			"content_type_json": "application/json",
		},
		"local": {
			"base_url": "http://localhost:3000",
			"content_type_json": "{{$shared content_type_json}}"
		},
				"dev": {
			"base_url": " http://175.45.201.100:8080",
			"content_type_json": "{{$shared content_type_json}}"
		},
	}
}
```

3. shift + cmd + P and find `Rest Client: Switch Environment` and select local(or other env)
4. move to any other \*.http in integration_test and click
   (before click, server should be running)

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
$ npm run test:seq

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## deployment

- test (TBD)
- [dev](https://docs.google.com/document/d/1hKW66dKuNfxiJk8gBfWDret-erIavvCKaX0UBBfTnew/edit)
- prod (TBD)

## License

TBD
