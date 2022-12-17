TODO

- Create backend server with fastify
- add login via google 


# POSTGRES
docker setup: 
`docker run -p 5432:5432 --name postgres -e POSTGRES_PASSWORD=letsrace -d postgres:15.1`

get into: 
`docker exec -it postgres psql -U postgres`

# REDIS
redis setup: 
`docker run -p 6379:6379 --name redis -d redis`

`docker exec -it redis redis-cli`