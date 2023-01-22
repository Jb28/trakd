const fs = require('fs');
const path = require('path');
import { Pool } from 'pg';
import { User } from './interfaces/User';
import cookie from '@fastify/cookie';
import type { FastifyCookieOptions } from '@fastify/cookie'
import cors from '@fastify/cors';
const fastify = require('fastify')({
    logger: false,
});
import { 
    createUser,
    loginUser,
    logoutUser,
    getUserSessionByKey
} from './services/login-service';
import { 
    createUserGarage,
    createUserVehicle,
    getUserGarageWithVehicles
} from './services/vehicle-management-service';

const envs = {
    authKeyValue: process.env.authKeyName || 'auth_key',
    port: process.env.port || 4000,
    signedCookies: process.env.signedCookies || false,
};

/* Setup */
const pgPool = new Pool({
    user: 'postgres',
    password: 'letsrace',
    database: 'local_test',
    port: 5432
});

fastify.register(cookie, {
    secret: fs.readFileSync(path.join(__dirname, 'secret-key')),
    hook: 'onRequest', // set to false to disable cookie autoparsing or set autoparsing on any of the following hooks: 'onRequest', 'preParsing', 'preHandler', 'preValidation'. default: 'onRequest'
    parseOptions: { 
        signed: envs.signedCookies,
        maxAge: 2592000 //30 days in seconds - 60*60*24*30
    },
} as FastifyCookieOptions);

fastify.register(cors, {
    origin: (origin: any, cb: any) => {
        if (origin === undefined) {
            // For Postman
            cb(null, true);
            return;
        }
        console.log('In: ' + origin);
        const hostname = new URL(origin).hostname
        if(hostname === "localhost"){
          //  Request from localhost will pass
          console.log('inside localhost');
          cb(null, true);
          return;
        }
        // Generate an error on other origins, disabling access
        cb(new Error("Not allowed"), false);
      }
})

// fastify.register(require('fastify-cookie'));
// fastify.register(require('fastify-session'), {
//     secret: fs.readFileSync(path.join(__dirname, 'secret-key')),
//     cookie: {
//         // Set the cookie to expire after 7 days
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//     },
// });

const verifyUserSession = async function(request: any, reply: any): Promise<User|null>{
    const userSessionKey = request.cookies[envs.authKeyValue];
    if (!userSessionKey) {
        reply.status(401).send({ message: 'You are not currently logged in.' });
        return null;
    }
    const userFromSessionKey = await getUserSessionByKey(pgPool, userSessionKey);
    if (!userFromSessionKey) {
        reply.status(401).send({ message: 'You are not currently logged in.' });
        return null;
    }
    return userFromSessionKey;
}

fastify.post('/user/create', (request: any, reply: any) => {
    //ToDo param validation
    const userDeviceInformation = {
        ip: request.ip
    };
    createUser(pgPool, { email: request.body.email, password: request.body.password }, userDeviceInformation)
        .then(loginSessionKey => {
            reply.setCookie(envs.authKeyValue, loginSessionKey, { path: '/' });
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
            reply.setCookie(envs.authKeyValue, extendedLoginSessionKey, { path: '/' }); 
            reply.send({ message: 'Logged in successfully' });
            console.log('Logged in user successfully');
        })
        .catch(error => {
            reply.status(401).send({message: 'Login error encountered, please retry later.'});
            console.log('Failed to log in user');
        });
});

fastify.post('/user/logout', async (request: any, reply: any) => {
    const user = await verifyUserSession(request, reply);
    if (!user){
        return;
    }
    const userSessionKey = request.cookies[envs.authKeyValue];
    const logoutSuccess = await logoutUser(pgPool, userSessionKey);
    if (logoutSuccess === true) {
        reply.clearCookie(envs.authKeyValue, userSessionKey, { path: '/' });
        reply.send({ message: 'Logged out successfully.' });
        return;
    }
    reply.status(401).send({ message: 'Unable to logout at this time, please try again later.' });
});

//ToDo
fastify.get('/user/profile', (request: any, reply: any) => {
    reply.status(401).send({ message: 'Not implemented' });
});

fastify.post('/user/garage/create', async (request: any, reply: any) => {
    //ToDo param validation
    const garageToCreate = {
        name: request.body.name
    };
    const user = await verifyUserSession(request, reply);
    if (!user){
        return;
    }
    const createdGarage = await createUserGarage(pgPool, user!, garageToCreate);
    if (!createdGarage) {;
        reply.status(500).send({ message: 'Unable to create garage at this time, please try again later.' });
        return
    }
    reply.send({ 
        message: 'Successfully created Garage!',
        data: {
            id: createdGarage.id,
            userid: createdGarage.userId,
            name: createdGarage.name,
            vehicles: [],
            createdOn: createdGarage.createdOn,
            updatedOn: createdGarage.updatedOn
        }
    })
});

fastify.get('/user/garage', async (request: any, reply: any) => {
    //ToDo param validation
    const garageId = parseInt(request.query.garageId);
    const user = await verifyUserSession(request, reply);
    if (!user){
        return;
    }
    const retrievedGarage = await getUserGarageWithVehicles(pgPool, user!, garageId);
    if (!retrievedGarage) {;
        reply.status(500).send({ message: 'Unable to retrieve garage at this time, please try again later.' });
        return
    }
    reply.send({ 
        message: 'Successfully retrieved Garage!',
        data: {
            id: retrievedGarage.id,
            userid: retrievedGarage.userId,
            name: retrievedGarage.name,
            vehicles: retrievedGarage.vehicles,
            createdOn: retrievedGarage.createdOn,
            updatedOn: retrievedGarage.updatedOn
        }
    })
});

fastify.post('/user/vehicle/create', async (request: any, reply: any) => {
    //ToDo param validation
    const vehicleToCreate = {        
        garageId: parseInt(request.body.garageId),
        type: request.body.type,
        make: request.body.make,
        model: request.body.model,
        year: new Date(request.body.year),
        description: request.body.description,
        history: request.body.history,
        imageUrl: request.body.imageUrl,
        modifications: request.body.modifications
    };
    const user = await verifyUserSession(request, reply);
    if (!user){
        return;
    }
    const createdVehicle = await createUserVehicle(pgPool, user!, vehicleToCreate);
    if (!createdVehicle) {;
        reply.status(500).send({ message: 'Unable to create garage at this time, please try again later.' });
        return
    }
    reply.send({ 
        message: 'Successfully created vehicle!',
        data: {    
            id: createdVehicle.id,
            userId: createdVehicle.userId,
            garageId: createdVehicle.garageId,
            type: createdVehicle.type,
            make: createdVehicle.make,
            model: createdVehicle.model,
            year: createdVehicle.year,
            description: createdVehicle.description,
            history: createdVehicle.history,
            imageUrl: createdVehicle.imageUrl,
            modifications: createdVehicle.modifications,
            createdOn: createdVehicle.createdOn,
            updatedOn: createdVehicle.updatedOn,
        }
    })
});

fastify.listen(envs.port, (err: any, address: any) => {
    if (err) throw err;
    fastify.log.info(`server listening on ${address}`);
});
