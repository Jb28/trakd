const crypto = require('crypto');
import { Pool } from 'pg';
import { 
    User, 
    UserDeviceInformation 
} from '../interfaces/User';
import { 
    insertNewUserToDB, 
    getUserByEmailFromDB,
    insertUserSession ,
    getUserSessionBySessionKeyAndUserId,
    extendExistingUserSession,
    logoutUserSession,
    getUserBySessionKey as getUserBySessionKeyFromDb
} from '../repositories/login-repository';

export const createUser = async function(pgPool: Pool, user: User, userDeviceInformation: UserDeviceInformation): Promise<string> {    
    if (user.password !== undefined) {
        if (user.password.length > 50 || user.password.length < 8) {
            throw new Error('Password must be between 8 and 50 characters');
        }
    }    
    user.passwordSalt = generateRandomHex(64);    
    user.passwordHashed = hashPasswordWithSalt(user.password!, user.passwordSalt);    
    user.username = user.email.split('@')[0].substring(0,10);    
    const response = await insertNewUserToDB(pgPool, user);    
    const loginSession = await loginUser(pgPool, user.email, user.password!, userDeviceInformation);
    delete user.password;
    return loginSession;
};

const hashPasswordWithSalt = function(password: string, salt: string): string {
    const hashedPlainPasswordBytes = crypto.scryptSync(password, new Buffer(salt), 64, { "N": 1024, "r": 8, "p": 1 });    
    return hashedPlainPasswordBytes.toString('hex');
};

//to generate session key
const generateHashForString = function(stringToHash: string) {
    const nodeSHA256 = crypto.createHash('sha256');
    nodeSHA256.update(stringToHash, 'utf8');
    return nodeSHA256.digest('hex');
};

const generateRandomBytesArray = function(length: number) {
    let bytes = [];
    try {
        bytes = crypto.randomBytes(length);
    } catch (ex) {
        for (let i = 0; i < length; i++) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
    }
    return bytes;
};

//to generate salt
const generateRandomHex = function(length: number) {
    if (length <= 0) {
        return '';
    }
    let randomHex = '';
    const byetsArray = generateRandomBytesArray(Math.ceil(length / 2));
    randomHex = byetsArray.toString('hex').slice(0, length);
    return randomHex;
};

export const loginUser = async function(pgPool: Pool, email: string, password: string, userDeviceInformation: UserDeviceInformation, currentSessionKey?: string): Promise<string> {
    //find user by email
    const user = await getUserByEmailFromDB(pgPool, email);

    //hash the passed in password + the salt applied to the user 
    const passedInPasswordHashedWithSalt = hashPasswordWithSalt(password, user.passwordSalt!);

    //if password does not match, error & return
    if (user.passwordHashed !== passedInPasswordHashedWithSalt) {
        throw new Error('Login error encountered, please retry later.');
    }

    //create a new user session
    return createUserSession(pgPool, user, userDeviceInformation, currentSessionKey);
};

const createUserSession = async function(pgPool: Pool, user: User, userDeviceInformation: UserDeviceInformation, currentSessionKey?: string): Promise<string> {
    if (!currentSessionKey){            
        const sessionKey = generateHashForString(`${user.id}-${Date.now()}-${generateRandomHex(128)}`);
        await insertUserSession(pgPool, user, sessionKey, userDeviceInformation);
        return sessionKey;
    }
    //search for existing session
    const currentUserSessionFromKey = await getUserSessionBySessionKeyAndUserId(pgPool, user, currentSessionKey);
    //if it exists, extend it    
    if (currentUserSessionFromKey) {
        await extendExistingUserSession(pgPool, user, currentSessionKey)
        return currentSessionKey;
    }
    const sessionKey = generateHashForString(`${user.id}-${Date.now()}-${generateRandomHex(128)}`);
    await insertUserSession(pgPool, user, sessionKey, userDeviceInformation);
    return sessionKey;
};

export const getUserSessionByKey = async function(pgPool: Pool, currentSessionKey: string): Promise<User|null> {
    //search for existing session
    const currentUserFromKey = await getUserBySessionKeyFromDb(pgPool, currentSessionKey);
    //if it exists, extend it    
    if (currentUserFromKey) {
        await extendExistingUserSession(pgPool, currentUserFromKey, currentSessionKey);
        return currentUserFromKey;
    }
    return null;
}

export const logoutUser = async function(pgPool: Pool, sessionKey: string): Promise<boolean>  {    
    return await logoutUserSession(pgPool, sessionKey);    
};