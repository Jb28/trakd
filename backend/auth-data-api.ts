const fs = require('fs');
const path = require('path');
import { Pool } from 'pg';
import { User } from './interfaces/User';
import { Garage } from "./interfaces/VehicleInterfaces";
import cookie from '@fastify/cookie';
import type { FastifyCookieOptions } from '@fastify/cookie'
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
    getGarageIdsForUser,
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

fastify.addHook('preHandler', (req: any, res: any, done: any) => {
    console.log('pre handler hit')
    // example logic for conditionally adding headers
    // const allowedPaths = ["/some", "/list", "/of", "/paths"];
    // if (allowedPaths.includes(req.routerPath)) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); //ToDo: this needs to come from envs
    res.header("Access-Control-Allow-Methods", "POST");
    res.header("Access-Control-Allow-Headers",  "Accept, Accept-Language, Content-Language, Content-Type");
    res.header("Access-Control-Allow-Credentials",  true);
    // }
  
    console.log(req.method);
    const isPreflight = /options/i.test(req.method);
    if (isPreflight) {
        console.log('preflight')
      return res.send();
    }
        
    done();
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
    if (!user) {
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

fastify.get('/user/profile', async (request: any, reply: any) => {
    // reply.status(401).send({ message: 'Not implemented' });
    const user = await verifyUserSession(request, reply);
    if (!user) {
        return;
    }
    reply.send({ 
        message: 'User retrieved',
        data: user        
    });
});

fastify.post('/user/garage/create', async (request: any, reply: any) => {
    //ToDo param validation
    const garageToCreate = {
        name: request.body.name
    };
    const user = await verifyUserSession(request, reply);
    if (!user) {
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
    const user = await verifyUserSession(request, reply);
    if (!user){
        return;
    }
    let garageIds: number[] = [];
    if (!parseInt(request.query.garageId)) {
        const retrievedGarageIds = await getGarageIdsForUser(pgPool, user);
        if (!retrievedGarageIds) {
            reply.status(500).send({ message: 'Unable to retrieve garage at this time, please try again later.' });
            return;
        }
        garageIds = retrievedGarageIds;
    } else {
        garageIds.push(parseInt(request.query.garageId));
    }
    const garagesToReturn: Garage[] = [];
    for (const garageId of garageIds) {
        const retrievedGarage = await getUserGarageWithVehicles(pgPool, user!, garageId);
        if (!retrievedGarage) {
            reply.status(500).send({ message: 'Unable to retrieve garage at this time, please try again later.' });
        }
        if (retrievedGarage){
            garagesToReturn.push(retrievedGarage);
        }
    }
    //todo data to return
    reply.send({ 
        message: 'Successfully retrieved Garage!',
        data: {
            garages: [
                garagesToReturn.map(garage => {
                    return {
                        id: garage.id,
                        userid: garage.userId,
                        name: garage.name,
                        vehicles: garage.vehicles,
                        createdOn: garage.createdOn,
                        updatedOn: garage.updatedOn
                    }
                })
            ]
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
