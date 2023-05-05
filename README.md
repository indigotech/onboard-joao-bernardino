﻿# Onboard Project 🚀

## Description

A server program able to:

1. Store some data in a database (db)
2.  [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) the data stored in db

## Environment and tools
Node.js is used as the runtime and Apollo Server is used to create a GraphQL server. Postgresql running on a docker container manages the database,  which is accessed through TypeORM. All code is written in TypeScript.

## Steps to run and debug
Install packages:
```
npm install
```
Start containers:
```
docker compose up -d
```
Run application:
```
npm start
```