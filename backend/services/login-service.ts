const moduleExports = {};
// import * as crypto from 'crypto';
const crypto = require('crypto');
import { Pool } from 'pg';
import { User } from '../interfaces/User';
// const { User } = require('../interfaces/User');
import { insertNewUser } from '../repositories/login-repository';

export const createUser = async function(pgPool: Pool, user: User): Promise<User> {
    
    //validate password format, can extract this
    if (user.password !== undefined) {
        if (user.password.length > 50 || user.password.length < 8) {
            throw new Error('Password must be between 8 and 50 characters');
        }
    }
    
    //choose a salt - make this random
    user.passwordSalt = 'abc';

    //encrypt password 
    const hashedPlainPasswordBytes = crypto.scryptSync(user.password, new Buffer(user.passwordSalt), 64, { "N": 1024, "r": 8, "p": 1 });    
    user.passwordHashed = hashedPlainPasswordBytes.toString('hex');
    

    //create username
    user.username = user.email.split('@')[0].substring(0,10);

    //store in database
    const response = await insertNewUser(pgPool, user);

    //log the user in

    delete user.password;

    return response;
};

export const loginUser = function(email: string, password: string) {
    //find user by email

    //hash the passed in password + the salt applied to the user 

    //if password does not match, error & return

    //create a new user session
};

export const validateUserSession = function(sessionKey: string) {
    //check user session exists

    //extend session by max session time
};

export const logoutUser = function(sessionKey: string) {
    //remove user session
};