TODO

- Create backend server with fastify
- add login via google 

# Useful links
TypeScript debug setup: https://pkief.medium.com/how-to-debug-typescript-with-vs-code-9cec93b4ae56

# POSTGRES
docker setup: 
`docker run -p 5432:5432 --name postgres -e POSTGRES_PASSWORD=letsrace -d postgres:15.1`

get into: 
`docker exec -it postgres psql -U postgres`

# REDIS
redis setup: 
`docker run -p 6379:6379 --name redis -d redis`

`docker exec -it redis redis-cli`

# TABLES 
```
CREATE TABLE user_main (
    id              bigserial UNIQUE,
    email           varchar(200) NOT NULL UNIQUE,
    password_hashed varchar(200) NOT NULL,
    password_salt   varchar(200) NOT NULL,
    username        varchar(30),
    avatar_url      varchar(400),
    country         varchar(50),
    is_activated    boolean default false,
    created_on      timestamp default current_timestamp,
    updated_on      timestamp default current_timestamp,
    PRIMARY KEY (id)
);

CREATE TABLE user_session_keys (
    key             varchar(128) PRIMARY KEY,
    user_id         bigint NOT NULL,
    created_on      timestamp default current_timestamp,
    ip              varchar(50) NOT NULL,
    country         varchar(50),
    device          varchar(500)
);

CREATE TABLE user_garage (
    id              bigserial UNIQUE,
    user_id         bigint NOT NULL,
    name            varchar(200) NOT NULL,
    created_on      timestamp default current_timestamp,
    updated_on      timestamp default current_timestamp
);

CREATE TABLE user_vehicle (
    id              bigserial UNIQUE,
    user_id         bigint NOT NULL,
    garage_id       bigint NOT NULL,
    type            varchar(20) NOT NULL,
    make            varchar(50) NOT NULL,
    model           varchar(100) NOT NULL,
    year            timestamp,
    description     varchar(500),
    history         varchar(1000),
    image_url       varchar(400),
    modifications   jsonb,
    created_on      timestamp default current_timestamp,
    updated_on      timestamp default current_timestamp
);
```