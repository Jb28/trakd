const fs = require('fs');
const path = require('path');
import { Pool } from 'pg';
import { UserDeviceInformation } from './interfaces/User';
const fastify = require('fastify')({
    logger: false,
});
import { 
    createUser,
    loginUser,
    logoutUser
} from './services/login-service';

/* Setup */
const pgPool = new Pool({
    user: 'postgres',
    password: 'letsrace',
    database: 'local_test',
    port: 5432
});
const envs = {
    authKeyValue: process.env.authKeyName || 'auth_key',
    port: process.env.port || 3000,
    signedCookies: process.env.signedCookies || false,
};

// fastify.register(require('fastify-cookie'));
// fastify.register(require('fastify-session'), {
//     secret: fs.readFileSync(path.join(__dirname, 'secret-key')),
//     cookie: {
//         // Set the cookie to expire after 7 days
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//     },
// });

fastify.register(require('@fastify/cookie'), {
    secret: fs.readFileSync(path.join(__dirname, 'secret-key')),
    hook: 'onRequest', // set to false to disable cookie autoparsing or set autoparsing on any of the following hooks: 'onRequest', 'preParsing', 'preHandler', 'preValidation'. default: 'onRequest'
    parseOptions: { signed: envs.signedCookies }, // options for parsing cookies
});

fastify.post('/user/create', (request: any, reply: any) => {
    //ToDo param validation
    const userDeviceInformation = {
        ip: request.ip
    };
    createUser(pgPool, { email: request.body.email, password: request.body.password }, userDeviceInformation)
        .then(loginSessionKey => {
            reply.setCookie(envs.authKeyValue, loginSessionKey);
            reply.send({ message: 'User created successfully' });    
        })
        .catch(err => {
            reply.status(401).send({message: 'Login error encountered, please retry later.'});
        });
});

fastify.post('/user/login/web', (request: any, reply: any) => {
    //ToDo param validation
    const userDeviceInformation = {
        ip: request.ip
    };
    loginUser(pgPool, request.body.email, request.body.password, userDeviceInformation, request.cookies[envs.authKeyValue])
        .then(extendedLoginSessionKey => {                        
            reply.setCookie(envs.authKeyValue, extendedLoginSessionKey); 
            reply.send({ message: 'Logged in successfully' });
        })
        .catch(error => {
            reply.status(401).send({message: 'Login error encountered, please retry later.'});
        });
});

//ToDo
fastify.get('/user/profile', (request: any, reply: any) => {
    // Check if the user is logged in
    const authkeyFromCookie = request.cookies.auth_key;
    //for signed cookies, TS was being lil bitch
    // if (signedCookies === true) {
    //     if (signedAuthkeyFromCookie === undefined) {
    //         reply.status(401).send({ message: 'Unauthorized' });
    //     }
    //     authkeyFromCookie = request.unsignCookie(signedAuthkeyFromCookie);
    // }

    //validate auth_key against service layer
    
    if (request.session.isLoggedIn) {
        reply.send({ message: `Welcome, ${request.session.username}` });
    } else {
        reply.status(401).send({ message: 'Unauthorized' });
    }
});

fastify.post('/user/logout', (request: any, reply: any) => {
    const userSessionKey = request.cookies[envs.authKeyValue];
    if (!userSessionKey) {
        reply.status(401).send({ message: 'You are not currently logged in.' });
        return;
    }
    logoutUser(pgPool, userSessionKey)
        .then(logoutSuccess => {
            if (logoutSuccess === true) {
                reply.send({ message: 'Logged out successfully.' });
                return;
            }
            reply.status(401).send({ message: 'Unable to logout at this time, please try again later.' });
        });
});

fastify.listen(envs.port, (err: any, address: any) => {
    if (err) throw err;
    fastify.log.info(`server listening on ${address}`);
});
