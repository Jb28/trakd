const fs = require('fs')
const path = require('path')
const fastify = require('fastify')({
    logger: false,
});

fastify.register(require('fastify-cookie'));
fastify.register(require('fastify-session'), {
    secret: fs.readFileSync(path.join(__dirname, 'secret-key')),
    cookie: {
        // Set the cookie to expire after 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
});

fastify.post('/login/web', (request, reply) => {
    // Validate the username and password
    if (request.body.username === 'admin' && request.body.password === 'password') {
        // Set the session data
        request.session.username = request.body.username;
        request.session.isLoggedIn = true;
        // Set the cookie
        // request.setCookie('auth_key', request.body.username); //todo - make this an auth key
        reply.send({ message: 'Logged in successfully' });
    } else {
        reply.status(401).send({ message: 'Invalid username or password' });
    }
});

fastify.get('/profile', (request, reply) => {
    // Check if the user is logged in
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
