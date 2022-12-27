import { Pool } from 'pg';
import { User, UserDeviceInformation } from '../interfaces/User';

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
            `INSERT INTO user_auth_keys (key, user_id, ip, country, device)
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