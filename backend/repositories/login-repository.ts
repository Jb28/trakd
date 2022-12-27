import { Pool } from 'pg';
import { User, UserDeviceInformation, UserSessionKey } from '../interfaces/User';

export const insertNewUserToDB = async function(pgPool: Pool, user: User): Promise<User> {    
    const client = await pgPool.connect();
    try {
        const result = await client.query(
            'INSERT INTO user_main (email, password_hashed, password_salt, username) VALUES ($1, $2, $3, $4)',
            [user.email, user.passwordHashed, user.passwordSalt, user.username]
        );
        return user;
    } catch (err) {
        console.log(`Postgres Error in insertNewUser: ${err}`);
        throw err;
    }finally {
        await client.release();    
    }
};

export const getUserByEmailFromDB = async function(pgPool: Pool, email: string): Promise<User> {
    const client = await pgPool.connect();
    try {
        const result = await client.query(
            `SELECT id, email, password_hashed, password_salt, username, avatar_url, country, is_activated, created_on, updated_on 
             FROM user_main
             WHERE email = $1`,
             [email]
        );
        const resultData = result.rows[0];
        let user: User = {
            id: resultData.id,
            email: resultData.email,
            passwordHashed: resultData.password_hashed,
            passwordSalt: resultData.password_salt, 
            username: resultData.username,
            avatarUrl: resultData.avatar_url,
            country: resultData.country,
            isActivated: resultData.is_activated,
            createdOn: resultData.created_on,
            updatedOn: resultData.updated_on,
        };        
        return user;
    } catch (err) {
        console.log(`Postgres Error in getUserByEmailFromDB: ${err}`);
        throw err;
    } finally {
        await client.release();  
    }
};

export const insertUserSession = async function(pgPool: Pool, user: User, sessionKey: string, userDeviceInformation: UserDeviceInformation): Promise<void> {
    const client = await pgPool.connect();
    try {
        const result = await client.query(
            `INSERT INTO user_session_keys (key, user_id, ip, country, device)
             VALUES ($1,$2,$3,$4,$5)`,
            [sessionKey, user.id, userDeviceInformation.ip, userDeviceInformation.country, userDeviceInformation.device]
        );        
    } catch (err) {
        console.log(`Postgres Error in insertUserSession: ${err}`);
        throw err;
    } finally {
        await client.release();
    }
};

export const getUserSessionBySessionKey = async function(pgPool: Pool, user: User, sessionKey?: string): Promise<UserSessionKey> {
    const client = await pgPool.connect();
    try {
        const result = await client.query(
            `SELECT key, user_id, created_on, current_timestamp, ip, country, device
             FROM user_session_keys
             WHERE key = $1, user_id = $2`,
            [sessionKey, user.id]
        );
        const resultData = result.rows[0];
        return {
            key: resultData.key,
            userId: resultData.user_id,
            createdOn: resultData.current_timestamp, //ToDo: Parse as Date required?
            ip: resultData.ip,
            country: resultData.country,
            device: resultData.device
        };
    } catch (err) {
        console.log(`Postgres Error in getUserSessionBySessionKey: ${err}`);
        throw err;
    } finally {
        await client.release();
    }
};

export const extendExistingUserSession = async function(pgPool: Pool, user: User, sessionKey?: string): Promise<UserSessionKey> {
    const client = await pgPool.connect();
    try {
        const result = await client.query(
            `UPDATE user_session_keys 
             SET created_on = $1
             WHERE key = $2, user_id = $3`,
            [new Date(), sessionKey, user.id]
        );
        const resultData = result.rows[0];
        return {
            key: resultData.key,
            userId: resultData.user_id,
            createdOn: resultData.current_timestamp, //ToDo: Parse as Date required?
            ip: resultData.ip,
            country: resultData.country,
            device: resultData.device
        };
    } catch (err) {
        console.log(`Postgres Error in extendExistingUserSession: ${err}`);
        throw err;
    } finally {
        await client.release();
    }
};