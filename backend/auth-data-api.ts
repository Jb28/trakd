const fs = require('fs');
const path = require('path');
const fastify = require('fastify')({
    logger: false,
});

// fastify.register(require('fastify-cookie'));
// fastify.register(require('fastify-session'), {
//     secret: fs.readFileSync(path.join(__dirname, 'secret-key')),
//     cookie: {
//         // Set the cookie to expire after 7 days
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//     },
// });

const signedCookies = process.env.signedCookies || false;

fastify.register(require('@fastify/cookie'), {
    secret: fs.readFileSync(path.join(__dirname, 'secret-key')),
    hook: 'onRequest', // set to false to disable cookie autoparsing or set autoparsing on any of the following hooks: 'onRequest', 'preParsing', 'preHandler', 'preValidation'. default: 'onRequest'
    parseOptions: { signed: signedCookies }, // options for parsing cookies
});

fastify.get('/login/web', (request, reply) => {
    // Validate the username and password
    if (request.query.username === 'admin' && request.query.password === 'password') {
        // Set the session data
        // request.session.username = request.query.username;
        // request.session.isLoggedIn = true;
        // Set the cookie
        reply.setCookie('auth_key', request.query.username); //todo - make this an auth key
        reply.send({ message: 'Logged in successfully' });
    } else {
        reply.status(401).send({ message: 'Invalid username or password' });
    }
});

fastify.get('/profile', (request, reply) => {
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

fastify.post('/logout', (request, reply) => {
    request.session.delete();
    reply.send('logged out');
});

fastify.listen(3000, (err, address) => {
    if (err) throw err;
    fastify.log.info(`server listening on ${address}`);
});
